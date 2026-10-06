import { apiClient, ApiResponse } from './apiClient';

export interface CreateOfferPayload {
  productId: string;
  amount: number;
  message?: string;
}

export interface OfferProductSummary {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  status: string;
  images: { originalUrl?: string; thumbnailUrl?: string }[];
}

export interface OfferUserSummary {
  id: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
}

export interface Offer {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  message?: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
  product: OfferProductSummary;
  buyer: OfferUserSummary;
  seller: OfferUserSummary;
}

export const offersApi = {
  /** Real POST /offers. The backend rejects this outright if the listing
   * isn't currently APPROVED (e.g. already SOLD) - see
   * OffersService.createOffer - so a sold listing can never actually
   * receive a new offer no matter what the client sends. */
  async createOffer(payload: CreateOfferPayload): Promise<ApiResponse<Offer>> {
    return apiClient.post('/offers', payload);
  },
  async getMadeOffers(): Promise<ApiResponse<Offer[]>> {
    return apiClient.get('/offers/made');
  },
  async getReceivedOffers(): Promise<ApiResponse<Offer[]>> {
    return apiClient.get('/offers/received');
  },
  async acceptOffer(id: string): Promise<ApiResponse<Offer>> {
    return apiClient.patch(`/offers/${id}/accept`, {});
  },
  async rejectOffer(id: string): Promise<ApiResponse<Offer>> {
    return apiClient.patch(`/offers/${id}/reject`, {});
  },
  async withdrawOffer(id: string): Promise<ApiResponse<Offer>> {
    return apiClient.patch(`/offers/${id}/withdraw`, {});
  },
};
