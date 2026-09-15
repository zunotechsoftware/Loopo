import { apiClient, ApiResponse } from './apiClient';
import { Product } from '@/types';


export interface CreateProductPayload {
  title: string;
  /** Real backend category UUID (see useCategories()) - NOT a display name. */
  categoryId: string;
  description: string;
  price: number;
  condition: string;
  location: string;
  images: string[];
  specs?: Record<string, string>;
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

function parseLocationString(locStr: string) {
  const parts = (locStr || '').split(',').map((p) => p.trim()).filter(Boolean);
  return {
    country: 'India',
    state: parts[1] || 'Karnataka',
    city: parts[1] ? parts[0] : 'Bangalore',
    area: parts[0] || 'Indiranagar',
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
  /** @param categoryId - real backend category UUID, not a display name (see useCategories()) */
  async getProducts(categoryId?: string, keyword?: string, city?: string): Promise<ApiResponse<Product[]>> {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (keyword) params.append('keyword', keyword);
    if (city) params.append('city', city);

    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';

    return apiClient.get<Product[]>(endpoint);
  },


  async getProductById(id: string): Promise<ApiResponse<Product>> {
    return apiClient.get<Product>(`/products/${id}`);
  },

  async createProduct(payload: CreateProductPayload): Promise<ApiResponse<Product>> {
    const dto = {
      title: payload.title,
      description: payload.description,
      categoryId: payload.categoryId,
      condition: mapConditionToEnum(payload.condition),
      price: Number(payload.price) || 0,
      location: parseLocationString(payload.location),
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
