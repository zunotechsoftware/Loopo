import { apiClient, ApiResponse } from './apiClient';
import { Product } from '@/types';


export interface CreateProductPayload {
  title: string;
  /** Real backend category UUID (see useCategories()) - NOT a display name. */
  categoryId: string;
  description: string;
  price: number;
  condition: string;
  /** Human display string, e.g. "Indiranagar, Bangalore, Karnataka" - only
   * used to build the location DTO when `locationDetails` isn't given.
   * Ambiguous to parse back apart (is "X, Y" area+city or city+state?),
   * so any caller that already has the real fields separately should pass
   * `locationDetails` instead rather than round-tripping through a string. */
  location: string;
  /** Structured location - preferred over parsing `location` back apart
   * when the caller already has real, separate fields (e.g. the sell
   * wizard, which has real city/area/pincode inputs, not a single
   * free-text field). */
  locationDetails?: { city: string; area?: string; state?: string; zipCode?: string };
  images: string[];
  specs?: Record<string, string>;
  negotiable?: boolean;
}

/** All fields optional - only what's provided gets sent to PUT /products/:id. */
export interface UpdateProductPayload {
  title?: string;
  description?: string;
  categoryId?: string;
  condition?: string;
  price?: number;
  location?: string;
}

function mapConditionToEnum(cond: string): 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' {
  const normalized = (cond || '').toUpperCase().replace(/\s+/g, '_');
  if (normalized.includes('BRAND') || normalized === 'NEW') return 'NEW';
  if (normalized.includes('LIKE')) return 'LIKE_NEW';
  if (normalized.includes('FAIR')) return 'FAIR';
  return 'GOOD';
}

/** Matches the fixed city dropdown in sell/location/page.tsx - used to
 * fill in a real state whenever a caller only supplies a city name. */
const CITY_STATE_MAP: Record<string, string> = {
  Bangalore: 'Karnataka',
  Mumbai: 'Maharashtra',
  Delhi: 'NCR',
  Hyderabad: 'Telangana',
  Chennai: 'Tamil Nadu',
  Pune: 'Maharashtra',
  Kolkata: 'West Bengal',
  Ahmedabad: 'Gujarat',
};

/** Parses a free-text "Area, City, State" (or shorter) display string back
 * into its parts. Ambiguous by nature - prefer passing structured fields
 * directly (see CreateProductPayload.locationDetails) whenever the caller
 * already has them, rather than round-tripping through a string like this. */
function parseLocationString(locStr: string) {
  const parts = (locStr || '').split(',').map((p) => p.trim()).filter(Boolean);
  let area: string | undefined;
  let city: string;
  let state: string | undefined;

  if (parts.length >= 3) {
    [area, city, state] = parts;
  } else if (parts.length === 2) {
    [city, state] = parts;
  } else if (parts.length === 1) {
    [city] = parts;
  } else {
    city = 'Bangalore';
  }

  return {
    country: 'India',
    state: state || CITY_STATE_MAP[city] || 'Karnataka',
    city,
    area: area || 'Indiranagar',
    zipCode: '560038',
  };
}

/** Decodes a `data:<mime>;base64,<...>` URL (what the sell flow's photo
 * picker produces) into a Blob suitable for a direct S3 PUT. */
function dataUrlToBlob(dataUrl: string): { blob: Blob; mimeType: string } {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/data:(.*?);base64/);
  const mimeType = mimeMatch?.[1] || 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { blob: new Blob([bytes], { type: mimeType }), mimeType };
}


export const productsApi = {
  /** @param categoryId - real backend category UUID, not a display name (see useCategories())
   * @param limit - defaults to the backend's own default (20) when omitted, matching prior
   * behaviour for callers that don't care (e.g. the home feed). Pages that need the full
   * result set for a filter (e.g. a category listing) should pass a larger value explicitly -
   * the real total is always returned separately (see fetchProductsThunk) regardless of limit. */
  async getProducts(categoryId?: string, keyword?: string, city?: string, sellerId?: string, limit?: number): Promise<ApiResponse<Product[]>> {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (keyword) params.append('keyword', keyword);
    if (city) params.append('city', city);
    if (sellerId) params.append('sellerId', sellerId);
    if (limit) params.append('limit', String(limit));

    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';

    return apiClient.get<Product[]>(endpoint);
  },


  async getProductById(id: string): Promise<ApiResponse<Product>> {
    return apiClient.get<Product>(`/products/${id}`);
  },

  async createProduct(payload: CreateProductPayload): Promise<ApiResponse<Product>> {
    const location = payload.locationDetails
      ? {
          country: 'India',
          city: payload.locationDetails.city,
          state: payload.locationDetails.state || CITY_STATE_MAP[payload.locationDetails.city] || 'Karnataka',
          area: payload.locationDetails.area || 'Indiranagar',
          zipCode: payload.locationDetails.zipCode || '560038',
        }
      : parseLocationString(payload.location);

    const dto = {
      title: payload.title,
      description: payload.description,
      categoryId: payload.categoryId,
      condition: mapConditionToEnum(payload.condition),
      price: Number(payload.price) || 0,
      location,
      negotiable: payload.negotiable ?? false,
    };

    return apiClient.post<Product>('/products', dto);
  },

  async updateProduct(id: string, payload: UpdateProductPayload): Promise<ApiResponse<Product>> {
    const dto: Record<string, unknown> = {};
    if (payload.title !== undefined) dto.title = payload.title;
    if (payload.description !== undefined) dto.description = payload.description;
    if (payload.categoryId !== undefined) dto.categoryId = payload.categoryId;
    if (payload.condition !== undefined) dto.condition = mapConditionToEnum(payload.condition);
    if (payload.price !== undefined) dto.price = Number(payload.price) || 0;
    if (payload.location !== undefined) dto.location = parseLocationString(payload.location);

    return apiClient.put<Product>(`/products/${id}`, dto);
  },

  /**
   * Uploads one photo (as a data URL) to a listing that already exists:
   * request a presigned S3 PUT url, upload the bytes directly to S3/MinIO
   * (bypassing apiClient - this goes straight to storage, not our backend,
   * and must not carry our Bearer token or a JSON content-type), then
   * register it against the listing. Returns false (never throws) on any
   * failure so one bad photo doesn't block the rest from uploading.
   */
  async uploadProductImage(productId: string, dataUrl: string, sortOrder: number): Promise<boolean> {
    try {
      const { blob, mimeType } = dataUrlToBlob(dataUrl);
      const ext = mimeType.split('/')[1] || 'jpg';
      const upRes = await apiClient.post<{ uploadUrl: string; fileKey: string; fileUrl: string }>(
        `/products/${productId}/images/upload-url`,
        { fileName: `photo-${sortOrder}.${ext}`, fileType: mimeType },
      );
      if (!upRes.success || !upRes.data) return false;
      const { uploadUrl, fileKey, fileUrl } = upRes.data;

      const putRes = await fetch(uploadUrl, { method: 'PUT', body: blob, headers: { 'Content-Type': mimeType } });
      if (!putRes.ok) return false;

      const attachRes = await apiClient.post(`/products/${productId}/images`, { fileUrl, fileKey, sortOrder });
      return attachRes.success;
    } catch {
      return false;
    }
  },

  /** Uploads a batch of photos sequentially (so one failure is isolated and
   * we don't hammer the presign endpoint with a burst of parallel requests
   * for what's normally <=10 images). Never throws. */
  async uploadProductImages(productId: string, dataUrls: string[]): Promise<{ uploaded: number; failed: number }> {
    let uploaded = 0;
    let failed = 0;
    for (let i = 0; i < dataUrls.length; i++) {
      const ok = await this.uploadProductImage(productId, dataUrls[i], i);
      if (ok) uploaded++;
      else failed++;
    }
    return { uploaded, failed };
  },

  async getCategories(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/categories');
  },

  async getMyAds(): Promise<ApiResponse<Product[]>> {
    return apiClient.get<Product[]>('/products/my');
  },

  async markAsSold(id: string): Promise<ApiResponse<any>> {
    return apiClient.patch(`/products/${id}/sold`, {});
  },

  async deleteAd(id: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`/products/${id}`);
  },
};
