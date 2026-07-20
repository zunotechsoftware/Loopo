import { Injectable, BadRequestException } from '@nestjs/common';
import { IPaymentProvider } from '../interfaces/payment-provider.interface';
import { StripeProvider } from './stripe.provider';
import { RazorpayProvider } from './razorpay.provider';
import { PaypalProvider } from './paypal.provider';

@Injectable()
export class PaymentProviderFactory {
  constructor(
    private readonly stripeProvider: StripeProvider,
    private readonly razorpayProvider: RazorpayProvider,
    private readonly paypalProvider: PaypalProvider,
  ) {}

  getProvider(code: string): IPaymentProvider {
    switch (code.toUpperCase()) {
      case 'STRIPE':
        return this.stripeProvider;
      case 'RAZORPAY':
        return this.razorpayProvider;
      case 'PAYPAL':
        return this.paypalProvider;
      default:
        throw new BadRequestException(`Unsupported payment provider: ${code}`);
    }
  }
}
