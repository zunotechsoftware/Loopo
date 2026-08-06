export interface PaymentProviderResponse {
  success: boolean;
  providerPaymentId?: string; // e.g. stripe PaymentIntent ID or razorpay payment ID
  providerOrderId?: string;   // e.g. razorpay order ID or paypal order ID
  clientSecret?: string;      // e.g. stripe client secret
  status: string;             // PENDING, SUCCESS, FAILED
  rawResponse: any;
}

export interface RefundProviderResponse {
  success: boolean;
  providerRefundId?: string;
  status: string;
  rawResponse: any;
}

export interface IPaymentProvider {
  createPayment(
    amount: number,
    currency: string,
    metadata: Record<string, any>,
  ): Promise<PaymentProviderResponse>;

  verifyPayment(
    providerPaymentId: string,
    providerOrderId: string,
    signature?: string,
  ): Promise<PaymentProviderResponse>;

  refundPayment(
    providerPaymentId: string,
    amount: number,
    reason?: string,
  ): Promise<RefundProviderResponse>;

  verifyWebhookSignature(
    rawBody: string,
    headers: Record<string, any>,
    secret: string,
  ): boolean;
}
