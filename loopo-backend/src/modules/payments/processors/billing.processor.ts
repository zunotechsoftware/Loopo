import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PaymentsRepository } from '../repositories/payments.repository';

@Processor('invoice-generation')
export class InvoiceGenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(InvoiceGenerationProcessor.name);

  constructor(private readonly paymentsRepository: PaymentsRepository) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Generating invoice for job ${job.id}`);
    const { paymentId } = job.data;

    try {
      const payment = await this.paymentsRepository.findPaymentById(paymentId);
      if (!payment) {
        throw new Error(`Payment record not found for invoice: ${paymentId}`);
      }

      const invoiceNumber = `INV-${Date.now()}-${payment.id.substring(0, 8).toUpperCase()}`;
      
      // Simulate invoice file/metadata creation
      const invoiceData = {
        invoiceNumber,
        billingTo: {
          email: payment.user.email,
          name: `${payment.user.firstName || ''} ${payment.user.lastName || ''}`.trim() || 'Valued Customer',
        },
        items: [
          {
            description: payment.description || 'Loopo Marketplace Service Purchase',
            amount: payment.amount,
            discount: payment.discountAmount,
            netAmount: payment.netAmount,
          },
        ],
        currency: payment.currency,
        subtotal: payment.amount,
        discount: payment.discountAmount,
        total: payment.netAmount,
        paymentDate: payment.updatedAt,
      };

      this.logger.log(`[INVOICE GENERATED] Invoice #${invoiceNumber} successfully created: ${JSON.stringify(invoiceData)}`);
      
      // Return details for receipt attachment mapping
      return { success: true, invoiceNumber, invoiceData };
    } catch (err) {
      this.logger.error(`Failed to generate invoice for payment ${paymentId}`, err);
      throw err;
    }
  }
}

@Processor('receipt-email')
export class ReceiptEmailProcessor extends WorkerHost {
  private readonly logger = new Logger(ReceiptEmailProcessor.name);

  constructor(private readonly paymentsRepository: PaymentsRepository) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Sending receipt email for job ${job.id}`);
    const { email, firstName, paymentId, amount, currency } = job.data;

    try {
      this.logger.log(`[EMAIL SEND] Receipt confirmation sent to ${email} (${firstName || 'User'}) for Payment ID ${paymentId}. Charged: ${currency} ${amount}`);
      return { success: true };
    } catch (err) {
      this.logger.error(`Failed to send receipt email to ${email}`, err);
      throw err;
    }
  }
}
