import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPaymentProvider, PaymentProviderResponse, RefundProviderResponse } from '../interfaces/payment-provider.interface';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class RazorpayProvider implements IPaymentProvider {
  private readonly logger = new Logger(RazorpayProvider.name);
  private razorpay: Razorpay;
  private keySecret: string;
  private webhookSecret: string;

  constructor(private readonly configService: ConfigService) {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID') || 'rzp_test_placeholder';
    this.keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET') || 'secret_placeholder';
    this.webhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET') || '';

    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: this.keySecret,
    });
  }

  async createPayment(
    amount: number,
    currency: string,
    metadata: Record<string, any>,
  ): Promise<PaymentProviderResponse> {
    try {
      this.logger.log(`Creating Razorpay Order for amount: ${amount} ${currency}`);
      // Razorpay expects amount in paise
      const razorpayAmount = Math.round(amount * 100);

      const order = await this.razorpay.orders.create({
        amount: razorpayAmount,
        currency: currency,
        receipt: `receipt_${Date.now()}`,
        notes: metadata,
      });

      return {
        success: true,
        providerOrderId: order.id,
        status: 'PENDING',
        rawResponse: order,
      };
    } catch (err) {
      this.logger.error('Razorpay createPayment failed', err);
      return {
        success: false,
        status: 'FAILED',
        rawResponse: err,
      };
    }
  }

  async verifyPayment(
    providerPaymentId: string,
    providerOrderId: string,
    signature?: string,
  ): Promise<PaymentProviderResponse> {
    try {
      this.logger.log(`Verifying Razorpay signature - Order ID: ${providerOrderId}, Payment ID: ${providerPaymentId}`);

      if (!signature) {
        // Fallback: fetch payment info directly from Razorpay
        const payment = await this.razorpay.payments.fetch(providerPaymentId);
        const success = payment.status === 'captured';
        return {
          success,
          providerPaymentId: payment.id as string,
          providerOrderId: payment.order_id as string,
          status: this.mapStatus(payment.status as string),
          rawResponse: payment,
        };
      }

      // Perform signature verification
      const generatedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${providerOrderId}|${providerPaymentId}`)
        .digest('hex');

      const isSignatureValid = generatedSignature === signature;

      if (!isSignatureValid) {
        this.logger.warn('Razorpay payment signature mismatch');
        return {
          success: false,
          status: 'FAILED',
          rawResponse: { error: 'Invalid signature mismatch' },
        };
      }

      // Fetch payment details to check status
      const paymentDetails = await this.razorpay.payments.fetch(providerPaymentId);

      // If verified but not captured, we can try to capture it
      let paymentStatus = paymentDetails.status as string;
      if (paymentStatus === 'authorized') {
        const capturedPayment = await this.razorpay.payments.capture(
          providerPaymentId,
          paymentDetails.amount as number,
          paymentDetails.currency as string,
        );
        paymentStatus = capturedPayment.status as string;
      }

      return {
        success: paymentStatus === 'captured',
        providerPaymentId,
        providerOrderId,
        status: this.mapStatus(paymentStatus),
        rawResponse: paymentDetails,
      };
    } catch (err) {
      this.logger.error(`Razorpay verifyPayment failed - Order: ${providerOrderId}, Payment: ${providerPaymentId}`, err);
      return {
        success: false,
        status: 'FAILED',
        rawResponse: err,
      };
    }
  }

  async refundPayment(
    providerPaymentId: string,
    amount: number,
    reason?: string,
  ): Promise<RefundProviderResponse> {
    try {
      this.logger.log(`Refunding Razorpay Payment: ${providerPaymentId}, Amount: ${amount}`);
      const refund = await this.razorpay.payments.refund(providerPaymentId, {
        amount: Math.round(amount * 100),
        notes: reason ? { reason } : undefined,
      });

      return {
        success: true,
        providerRefundId: refund.id,
        status: 'SUCCESS',
        rawResponse: refund,
      };
    } catch (err) {
      this.logger.error(`Razorpay refund failed for Payment ID ${providerPaymentId}`, err);
      return {
        success: false,
        status: 'FAILED',
        rawResponse: err,
      };
    }
  }

  verifyWebhookSignature(
    rawBody: string,
    headers: Record<string, any>,
    secret: string,
  ): boolean {
    const bypass = this.configService.get<string>('BYPASS_WEBHOOK_SIGNATURE_FOR_TESTING') === 'true';
    if (bypass) {
      this.logger.warn('Bypassing Razorpay webhook signature verification for testing purposes');
      return true;
    }

    try {
      const signature = headers['x-razorpay-signature'];
      if (!signature) return false;

      const verifySecret = secret || this.webhookSecret;
      const expectedSignature = crypto
        .createHmac('sha256', verifySecret)
        .update(rawBody)
        .digest('hex');

      return expectedSignature === signature;
    } catch (err) {
      this.logger.error('Razorpay webhook signature verification failed', err);
      return false;
    }
  }

  private mapStatus(razorpayStatus: string): string {
    switch (razorpayStatus) {
      case 'created':
      case 'authorized':
        return 'PENDING';
      case 'captured':
        return 'SUCCESS';
      case 'refunded':
        return 'REFUNDED';
      case 'failed':
        return 'FAILED';
      default:
        return 'FAILED';
    }
  }
}
