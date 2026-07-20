import { Module } from '@nestjs/common';
import { ModerationController } from './controllers/moderation.controller';
import { ModerationService } from './services/moderation.service';
import { ModerationPipelineService } from './services/moderation-pipeline.service';
import { ModerationRepository } from './repositories/moderation.repository';
import {
  EvidenceProcessingProcessor,
  AiModerationProcessor,
  ReportNotificationsProcessor,
} from './processors/moderation.processor';

@Module({
  controllers: [ModerationController],
  providers: [
    ModerationService,
    ModerationPipelineService,
    ModerationRepository,
    EvidenceProcessingProcessor,
    AiModerationProcessor,
    ReportNotificationsProcessor,
  ],
  exports: [ModerationService, ModerationPipelineService, ModerationRepository],
})
export class ModerationModule {}
