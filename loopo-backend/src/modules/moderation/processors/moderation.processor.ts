import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { PrismaService } from '../../../shared/database/prisma.service';
import { ModerationPipelineService } from '../services/moderation-pipeline.service';

@Processor('evidence-processing')
@Injectable()
export class EvidenceProcessingProcessor extends WorkerHost {
  private readonly logger = new Logger(EvidenceProcessingProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { reportId } = job.data;
    this.logger.log(`Processing evidence files for report: ${reportId}`);
    
    // Simulate async virus scan and image validation
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    this.logger.log(`Evidence processing completed for report: ${reportId}`);
    return { success: true, verified: true };
  }
}

@Processor('ai-moderation')
@Injectable()
export class AiModerationProcessor extends WorkerHost {
  private readonly logger = new Logger(AiModerationProcessor.name);

  constructor(private readonly pipelineService: ModerationPipelineService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { reportId } = job.data;
    this.logger.log(`Triggering AI auto-moderation evaluation for report: ${reportId}`);
    
    const result = await this.pipelineService.runAutoModeration(reportId);
    
    this.logger.log(`AI Moderation process complete. Auto Action Taken: ${result.autoActionTaken}`);
    return result;
  }
}

@Processor('report-notifications')
@Injectable()
export class ReportNotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(ReportNotificationsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { reportId, reporterId } = job.data;
    this.logger.log(`Sending confirmation notification to reporter: ${reporterId} for report: ${reportId}`);

    // Send push notification via shared notification queue
    await this.notificationQueue.add('push-notification', {
      userId: reporterId,
      title: 'Report Received',
      body: `We have received your report and are investigating it. Reference: ${reportId.substring(0, 8)}.`,
    });

    return { success: true };
  }
}
