import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPaymentProvider, PaymentProviderResponse, RefundProviderResponse } from '../interfaces/payment-provider.interface';
import Stripe from 'stripe';

@Injectable()
export class StripeProvider implements IPaymentProvider {
  private readonly logger = new Logger(StripeProvider.name);
  private stripe: Stripe;
  private apiKey: string;
  private webhookSecret: string;
  private readonly isConfigured: boolean;
  private readonly isProduction: boolean;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_placeholder';
    this.isConfigured = this.apiKey !== 'sk_test_placeholder';
    this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    if (!this.isConfigured && this.isProduction) {
      // Don't throw here: Stripe is one of several payment providers (see
      // payment-provider.factory.ts) and this class is eagerly constructed
      // by Nest's DI at app bootstrap regardless of whether any request ever
      // uses it. Throwing would crash the entire backend - auth, listings,
      // chat, everything - over one optional, unconfigured payment gateway.
      // Instead: log loudly, and every method below refuses real work
      // (returns a clean failure) rather than either crashing or - the
      // actual security concern - silently simulating a fake success.
      this.logger.error(
        'STRIPE_SECRET_KEY is not configured in production. Stripe payments will fail closed until this is set.',
      );
    }

    this.stripe = new Stripe(this.apiKey, {
      apiVersion: '2025-01-27.acacia' as any, // use current/compatible api version
    });
    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
  }

  async createPayment(
    amount: number,
    currency: string,
    metadata: Record<string, any>,
  ): Promise<PaymentProviderResponse> {
    const isMock = !this.isConfigured || this.isBypassGatewayApi();
    if (isMock) {
      if (!this.isConfigured && this.isProduction) {
        this.logger.error('Refusing to create a Stripe payment in production: STRIPE_SECRET_KEY not configured.');
        return { success: false, status: 'FAILED', rawResponse: { error: 'Stripe is not configured' } };
      }
      this.logger.warn('Stripe API Key is placeholder. Returning simulated payment intent.');
      return {
        success: true,
        providerPaymentId: `pi_mock_${Date.now()}`,
        clientSecret: `pi_mock_secret_${Date.now()}`,
        status: 'PENDING',
        rawResponse: { simulated: true },
      };
    }

    try {
      this.logger.log(`Creating Stripe PaymentIntent for amount: ${amount} ${currency}`);
      // Stripe expects amount in cents/smallest currency unit
      const stripeAmount = Math.round(amount * 100);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: stripeAmount,
        currency: currency.toLowerCase(),
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        providerPaymentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || undefined,
        status: this.mapStatus(paymentIntent.status),
        rawResponse: paymentIntent,
      };
    } catch (err) {
      this.logger.error('Stripe createPayment failed', err);
      return {
        success: false,
        status: 'FAILED',
        rawResponse: err,
      };
    }
  }

  async verifyPayment(
    providerPaymentId: string,
    providerOrderId?: string,
    signature?: string,
  ): Promise<PaymentProviderResponse> {
    // Deliberately NOT keying off providerPaymentId.startsWith('pi_mock_'):
    // that value is client-supplied (see payments.service.ts.verifyPayment,
    // which forwards dto.providerPaymentId from the request body), so
    // trusting its prefix would let anyone bypass real verification just by
    // sending a fake 'pi_mock_...' id, even with a real STRIPE_SECRET_KEY
    // configured. Whether we're in mock mode is a provider-level fact, not
    // something the caller gets to assert.
    const isMock = !this.isConfigured || this.isBypassGatewayApi();
    if (isMock) {
      if (!this.isConfigured && this.isProduction) {
        this.logger.error('Refusing to verify a Stripe payment in production: STRIPE_SECRET_KEY not configured.');
        return { success: false, status: 'FAILED', rawResponse: { error: 'Stripe is not configured' } };
      }
      return {
        success: true,
        providerPaymentId,
        status: 'SUCCESS',
        rawResponse: { simulated: true },
      };
    }

    try {
      this.logger.log(`Verifying Stripe PaymentIntent: ${providerPaymentId}`);
      const paymentIntent = await this.stripe.paymentIntents.retrieve(providerPaymentId);

      return {
        success: paymentIntent.status === 'succeeded',
        providerPaymentId: paymentIntent.id,
        status: this.mapStatus(paymentIntent.status),
        rawResponse: paymentIntent,
      };
    } catch (err) {
      this.logger.error(`Stripe verifyPayment failed for ID ${providerPaymentId}`, err);
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
    const isMock = !this.isConfigured || this.isBypassGatewayApi();
    if (isMock) {
      if (!this.isConfigured && this.isProduction) {
        this.logger.error('Refusing to refund a Stripe payment in production: STRIPE_SECRET_KEY not configured.');
        return { success: false, status: 'FAILED', rawResponse: { error: 'Stripe is not configured' } };
      }
      return {
        success: true,
        providerRefundId: `re_mock_${Date.now()}`,
        status: 'SUCCESS',
        rawResponse: { simulated: true },
      };
    }

    try {
      this.logger.log(`Creating Stripe Refund for PaymentIntent: ${providerPaymentId}, Amount: ${amount}`);
      const refund = await this.stripe.refunds.create({
        payment_intent: providerPaymentId,
        amount: Math.round(amount * 100),
        reason: 'requested_by_customer',
        metadata: reason ? { reason } : undefined,
      });

      return {
        success: refund.status === 'succeeded' || refund.status === 'pending',
        providerRefundId: refund.id,
        status: refund.status === 'succeeded' ? 'SUCCESS' : 'PENDING',
        rawResponse: refund,
      };
    } catch (err) {
      this.logger.error(`Stripe refund failed for PaymentIntent ID ${providerPaymentId}`, err);
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
    const bypass =
      this.configService.get<string>('BYPASS_WEBHOOK_SIGNATURE_FOR_TESTING') === 'true' &&
      this.configService.get<string>('NODE_ENV') !== 'production';
    if (bypass) {
      this.logger.warn('Bypassing Stripe webhook signature verification for testing purposes');
      return true;
    }

    try {
      const signature = headers['stripe-signature'];
      if (!signature) return false;

      const verifySecret = secret || this.webhookSecret;
      if (!verifySecret) {
        this.logger.error('Stripe webhook secret not configured; rejecting webhook');
        return false;
      }
      this.stripe.webhooks.constructEvent(rawBody, signature, verifySecret);
      return true;
    } catch (err) {
      this.logger.error('Stripe webhook signature verification failed', err);
      return false;
    }
  }

  /** BYPASS_GATEWAY_API is a local-dev convenience only — never honored in production. */
  private isBypassGatewayApi(): boolean {
    return (
      this.configService.get<string>('BYPASS_GATEWAY_API') === 'true' &&
      this.configService.get<string>('NODE_ENV') !== 'production'
    );
  }

  private mapStatus(stripeStatus: string): string {
    switch (stripeStatus) {
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        return 'PENDING';
      case 'processing':
        return 'PROCESSING';
      case 'succeeded':
        return 'SUCCESS';
      case 'canceled':
        return 'CANCELLED';
      case 'requires_capture':
        return 'PROCESSING';
      default:
        return 'FAILED';
    }
  }
}
