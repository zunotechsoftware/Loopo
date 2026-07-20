import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ReportsRepository } from '../repositories/reports.repository';
import { CreateReportDto } from '../dto/create-report.dto';
import { ReportQueryDto } from '../dto/report-query.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ReportStatus, PriorityLevel, ReportTargetType } from '@prisma/client';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly reportsRepository: ReportsRepository,
    @InjectQueue('evidence-processing') private readonly evidenceQueue: Queue,
    @InjectQueue('ai-moderation') private readonly aiQueue: Queue,
    @InjectQueue('report-notifications') private readonly notificationsQueue: Queue,
  ) {}

  async createReport(userId: string, dto: CreateReportDto) {
    this.logger.log(`User ${userId} reporting target ${dto.targetId} (Type: ${dto.targetType})`);

    // 1. Verify target reason exists
    const reason = await this.reportsRepository.findReasonByCode(dto.reasonCode);
    if (!reason) {
      throw new BadRequestException(`Report reason code '${dto.reasonCode}' is invalid or inactive`);
    }

    // 2. Prevent spam: check if user has already filed an active report against this exact target
    const existing = await this.reportsRepository.prisma.report.findFirst({
      where: {
        reporterId: userId,
        targetId: dto.targetId,
        targetType: dto.targetType as any,
        status: {
          in: [ReportStatus.OPEN, ReportStatus.ASSIGNED, ReportStatus.UNDER_REVIEW],
        },
        deletedAt: null,
      },
    });

    if (existing) {
      throw new BadRequestException('You have already filed an active report for this content. It is currently under review.');
    }

    // 3. Create case if it doesn't exist, or auto-moderate
    // Every report starts open, but we group reports on the same target under the same case
    let targetCase = await this.reportsRepository.prisma.moderationCase.findFirst({
      where: {
        reports: {
          some: {
            targetId: dto.targetId,
            targetType: dto.targetType as any,
          },
        },
        status: {
          in: [ReportStatus.OPEN, ReportStatus.ASSIGNED, ReportStatus.UNDER_REVIEW, ReportStatus.ESCALATED],
        },
        deletedAt: null,
      },
    });

    if (!targetCase) {
      targetCase = await this.reportsRepository.createCase({
        title: `Investigation case for ${dto.targetType} ${dto.targetId}`,
        description: `Grouped investigations for reported target: ${dto.targetId}`,
        status: ReportStatus.OPEN,
        priority: PriorityLevel.MEDIUM,
      });
    }

    // 4. Create the report in DB
    const report = await this.reportsRepository.createReport(
      {
        reporterId: userId,
        targetType: dto.targetType as any,
        targetId: dto.targetId,
        reasonCode: dto.reasonCode,
        customReason: dto.customReason || null,
        details: dto.details,
        status: ReportStatus.OPEN,
        priority: PriorityLevel.MEDIUM,
        caseId: targetCase.id,
      },
      dto.evidence || [],
    );

    // 5. Trigger async processing jobs
    if (dto.evidence && dto.evidence.length > 0) {
      await this.evidenceQueue.add('process-evidence', { reportId: report!.id });
    }

    // AI pipeline trigger
    await this.aiQueue.add('analyze-report', { reportId: report!.id });

    // Notifications dispatch
    await this.notificationsQueue.add('send-report-filed', {
      reportId: report!.id,
      reporterId: userId,
    });

    return report;
  }

  async getMyReports(userId: string) {
    return this.reportsRepository.findReportsByReporter(userId);
  }

  async getReportById(userId: string, id: string) {
    const report = await this.reportsRepository.findReportById(id);
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    // Users can only view their own reports
    if (report.reporterId !== userId) {
      throw new BadRequestException('Unauthorized check on report record');
    }
    return report;
  }

  async deleteReport(userId: string, id: string) {
    const report = await this.reportsRepository.findReportById(id);
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    if (report.reporterId !== userId) {
      throw new BadRequestException('Unauthorized delete on report record');
    }
    return this.reportsRepository.deleteReport(id);
  }

  // --- ADMIN REPORTS MANAGEMENT ---

  async getAdminReports(dto: ReportQueryDto) {
    return this.reportsRepository.findReports({
      status: dto.status as any,
      targetType: dto.targetType as any,
      priority: dto.priority as any,
      assignedModeratorId: dto.assignedModeratorId,
    });
  }

  async getAdminReportById(id: string) {
    const report = await this.reportsRepository.findReportById(id);
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    return report;
  }

  async assignReport(adminUserId: string, reportId: string, moderatorId: string) {
    const report = await this.reportsRepository.findReportById(reportId);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (!report.caseId) {
      throw new BadRequestException('Report does not belong to a case');
    }

    // 1. Update Case
    await this.reportsRepository.updateCase(report.caseId, {
      assignedModeratorId: moderatorId,
      status: ReportStatus.ASSIGNED,
    });

    // 2. Record Assignment log
    await this.reportsRepository.prisma.caseAssignment.create({
      data: {
        caseId: report.caseId,
        moderatorId,
        assignedById: adminUserId,
      },
    });

    // 3. Update Report status
    await this.reportsRepository.prisma.report.update({
      where: { id: reportId },
      data: { status: ReportStatus.ASSIGNED },
    });

    // 4. Notify Moderator
    await this.notificationsQueue.add('send-moderator-assigned', {
      caseId: report.caseId,
      moderatorId,
    });

    return { success: true, caseId: report.caseId };
  }

  async updateReportStatus(reportId: string, status: ReportStatus, priority?: PriorityLevel) {
    const report = await this.reportsRepository.findReportById(reportId);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    await this.reportsRepository.prisma.report.update({
      where: { id: reportId },
      data: {
        status: status as any,
        priority: priority ? (priority as any) : undefined,
      },
    });

    if (report.caseId) {
      await this.reportsRepository.updateCase(report.caseId, {
        status: status as any,
        priority: priority ? (priority as any) : undefined,
      });
    }

    return { success: true };
  }

  async escalateReport(adminUserId: string, reportId: string, noteText: string) {
    const report = await this.reportsRepository.findReportById(reportId);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (!report.caseId) {
      throw new BadRequestException('Report does not belong to a case');
    }

    // Escalate Case Priority to CRITICAL
    await this.reportsRepository.updateCase(report.caseId, {
      status: ReportStatus.ESCALATED,
      priority: PriorityLevel.CRITICAL,
    });

    await this.reportsRepository.prisma.report.update({
      where: { id: reportId },
      data: {
        status: ReportStatus.ESCALATED,
        priority: PriorityLevel.CRITICAL,
      },
    });

    // Add note
    await this.reportsRepository.prisma.moderationNote.create({
      data: {
        caseId: report.caseId,
        moderatorId: adminUserId,
        note: `[ESCALATION NOTE] ${noteText}`,
      },
    });

    return { success: true };
  }
}
