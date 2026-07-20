import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { PriorityLevel, ReportStatus } from '@prisma/client';

@Injectable()
export class ModerationPipelineService {
  private readonly logger = new Logger(ModerationPipelineService.name);

  constructor(private readonly prisma: PrismaService) {}

  async runAutoModeration(reportId: string): Promise<{ autoActionTaken: boolean; score: number }> {
    this.logger.log(`Running auto-moderation pipeline for report: ${reportId}`);

    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) return { autoActionTaken: false, score: 0 };

    const textToAnalyze = `${report.details} ${report.customReason || ''}`.toLowerCase();
    
    // Simulate AI pipeline classifiers (OpenAI Moderation API / Google Perspective score)
    let violationScore = 0.1;

    // Local heuristic scanning for critical tags
    const scamFlags = ['scam', 'fraud', 'steal', 'money back', 'hack'];
    const abusiveFlags = ['hate', 'kill', 'fuck', 'abusive', 'bitch', 'asshole'];
    const illegalFlags = ['drugs', 'weapons', 'counterfeit', 'replica', 'weed'];

    if (scamFlags.some((flag) => textToAnalyze.includes(flag))) {
      violationScore = 0.88;
    } else if (abusiveFlags.some((flag) => textToAnalyze.includes(flag))) {
      violationScore = 0.95;
    } else if (illegalFlags.some((flag) => textToAnalyze.includes(flag))) {
      violationScore = 0.92;
    }

    this.logger.log(`AI Moderation Pipeline calculated violation score: ${violationScore}`);

    // If score exceeds critical auto-moderation action threshold (e.g. 0.85)
    if (violationScore >= 0.85) {
      this.logger.warn(`Critical violation detected (score: ${violationScore}). Executing auto-moderation rules.`);

      // 1. Automatically escalate report to CRITICAL priority
      await this.prisma.report.update({
        where: { id: reportId },
        data: {
          priority: PriorityLevel.CRITICAL,
          status: ReportStatus.UNDER_REVIEW,
        },
      });

      if (report.caseId) {
        await this.prisma.moderationCase.update({
          where: { id: report.caseId },
          data: {
            priority: PriorityLevel.CRITICAL,
            status: ReportStatus.UNDER_REVIEW,
          },
        });

        // Write audit log notes
        await this.prisma.moderationNote.create({
          data: {
            caseId: report.caseId,
            moderatorId: report.reporterId, // System actor fallback or reporter ID
            note: `[AUTO-MODERATION SYSTEM] Violation detected (Score: ${violationScore}). Priority escalated to CRITICAL.`,
          },
        });
      }

      // 2. Hide Content (Auto-moderated) if it is a listing or chat message
      if (report.targetType === 'LISTING') {
        await this.prisma.product.update({
          where: { id: report.targetId },
          data: {
            status: 'UNDER_REVIEW', // Revert public listing to moderation review state
          },
        }).catch((err) => {
          this.logger.error(`Failed auto-hiding product listing target ID ${report.targetId}`, err);
        });
      }

      return { autoActionTaken: true, score: violationScore };
    }

    return { autoActionTaken: false, score: violationScore };
  }
}
