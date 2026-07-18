import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('sms')
export class SmsProcessor extends WorkerHost {
  private readonly logger = new Logger(SmsProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing SMS job ${job.id} of type ${job.name}...`);
    const { phone, otp } = job.data;

    switch (job.name) {
      case 'send-otp':
        this.logger.log(`[SMS SEND] OTP Code [${otp}] sent to phone number ${phone}`);
        break;

      default:
        this.logger.warn(`Unknown SMS job type: ${job.name}`);
        break;
    }
    return { success: true };
  }
}
