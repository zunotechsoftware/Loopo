import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('notification')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing notification job ${job.id} of type ${job.name}...`);
    
    if (job.name === 'push-notification') {
      const { userId, title, body } = job.data;
      this.logger.log(`[PUSH NOTIFICATION] Sent to User ID ${userId}: Title: "${title}", Body: "${body}"`);
    } else {
      this.logger.log(`[NOTIFICATION] Generic notification type ${job.name} processed.`);
    }

    return { success: true };
  }
}
