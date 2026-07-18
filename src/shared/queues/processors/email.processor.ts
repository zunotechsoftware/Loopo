import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing email job ${job.id} of type ${job.name}...`);
    const { email, token, firstName } = job.data;

    switch (job.name) {
      case 'send-verification':
        this.logger.log(`[EMAIL SEND] Verification link: http://localhost:3000/api/v1/auth/verify-email?token=${token} sent to ${email} (${firstName})`);
        break;

      case 'send-reset-password':
        this.logger.log(`[EMAIL SEND] Reset password link: http://localhost:3000/api/v1/auth/reset-password?token=${token} sent to ${email}`);
        break;

      default:
        this.logger.warn(`Unknown email job type: ${job.name}`);
        break;
    }
    return { success: true };
  }
}
