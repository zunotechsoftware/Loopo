import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PaymentsService } from '../services/payments.service';
import { PaymentsRepository } from '../repositories/payments.repository';
import { PaymentStatus } from '@prisma/client';

@Processor('webhook-processing')
export class WebhookProcessingProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhookProcessingProcessor.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentsRepository: PaymentsRepository,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Running webhook processing job: ${job.id}`);
    const { webhookLogId, provider, eventType } = job.data;

    const log = await this.paymentsRepository.prisma.paymentWebhook.findUnique({
      where: { id: webhookLogId },
    });

    if (!log) {
      this.logger.error(`Webhook log record not found: ${webhookLogId}`);
      return { success: false, error: 'Record not found' };
    }

    try {
      const payload: any = log.payload;
      let paymentId: string | null = null;
      let isSuccess = false;
      let isFailure = false;

      // Extract details based on provider
      if (provider === 'STRIPE') {
        const object = payload.data?.object || {};
        paymentId = object.metadata?.paymentId || null;

        if (eventType === 'payment_intent.succeeded') {
          isSuccess = true;
        } else if (eventType === 'payment_intent.payment_failed') {
          isFailure = true;
        }
      } else if (provider === 'RAZORPAY') {
        const payloadDetails = payload.payload?.payment?.entity || {};
        paymentId = payloadDetails.notes?.paymentId || null;

        if (eventType === 'payment.captured') {
          isSuccess = true;
        } else if (eventType === 'payment.failed') {
          isFailure = true;
        }
      } else if (provider === 'PAYPAL') {
        const resource = payload.resource || {};
        paymentId = resource.custom_id || null;

        if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
          isSuccess = true;
        } else if (eventType === 'PAYMENT.CAPTURE.DENIED') {
          isFailure = true;
        }
      }

      if (paymentId) {
        const payment = await this.paymentsRepository.findPaymentById(paymentId);
        if (payment && payment.status === PaymentStatus.PENDING) {
          if (isSuccess) {
            this.logger.log(`Webhook triggered fulfillment of payment: ${paymentId}`);
            await this.paymentsService.verifyPayment(payment.userId, {
              paymentId,
              providerPaymentId: payment.providerPaymentId || undefined,
              providerOrderId: payment.providerOrderId || undefined,
            });
          } else if (isFailure) {
            this.logger.log(`Webhook triggered failure of payment: ${paymentId}`);
            await this.paymentsRepository.updatePayment(paymentId, {
              status: PaymentStatus.FAILED,
            });
          }
        }
      }

      // Update Webhook log to processed
      await this.paymentsRepository.updateWebhookLog(log.id, {
        status: 'PROCESSED',
        processedAt: new Date(),
      });

      return { success: true };
    } catch (err) {
      this.logger.error(`Failed to process webhook ID ${webhookLogId}`, err);
      await this.paymentsRepository.updateWebhookLog(log.id, {
        status: 'FAILED',
        error: err.message || err.toString(),
      });
      throw err;
    }
  }
}

@Processor('payment-verification')
export class PaymentVerificationProcessor extends WorkerHost {
  private readonly logger = new Logger(PaymentVerificationProcessor.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentsRepository: PaymentsRepository,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Running stale payment verification checker job ${job.id}`);
    
    // Fetch pending or processing payments older than 30 minutes
    const thresholdDate = new Date();
    thresholdDate.setMinutes(thresholdDate.getMinutes() - 30);

    const pendingPayments = await this.paymentsRepository.prisma.payment.findMany({
      where: {
        status: {
          in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING],
        },
        createdAt: {
          lt: thresholdDate,
        },
      },
    });

    this.logger.log(`Found ${pendingPayments.length} stale payments to verify`);

    for (const payment of pendingPayments) {
      try {
        await this.paymentsService.verifyPayment(payment.userId, {
          paymentId: payment.id,
        });
      } catch (err) {
        this.logger.error(`Failed auto-verifying stale payment ${payment.id}`, err);
      }
    }

    return { verifiedCount: pendingPayments.length };
  }
}
