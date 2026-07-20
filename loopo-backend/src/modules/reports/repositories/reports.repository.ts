import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma, ReportStatus, PriorityLevel, ReportTargetType } from '@prisma/client';

@Injectable()
export class ReportsRepository {
  constructor(public readonly prisma: PrismaService) {}

  async createReport(
    data: Prisma.ReportUncheckedCreateInput,
    evidence?: Prisma.ReportEvidenceUncheckedCreateWithoutReportInput[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      const report = await tx.report.create({
        data,
      });

      if (evidence && evidence.length > 0) {
        await tx.reportEvidence.createMany({
          data: evidence.map((e) => ({
            ...e,
            reportId: report.id,
          })),
        });
      }

      return tx.report.findUnique({
        where: { id: report.id },
        include: { evidence: true },
      });
    });
  }

  async findReportById(id: string) {
    return this.prisma.report.findUnique({
      where: { id },
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        evidence: true,
        case: true,
      },
    });
  }

  async findReports(filters: {
    status?: ReportStatus;
    targetType?: ReportTargetType;
    priority?: PriorityLevel;
    assignedModeratorId?: string;
  }) {
    const whereClause: Prisma.ReportWhereInput = { deletedAt: null };

    if (filters.status) {
      whereClause.status = filters.status;
    }
    if (filters.targetType) {
      whereClause.targetType = filters.targetType;
    }
    if (filters.priority) {
      whereClause.priority = filters.priority;
    }
    if (filters.assignedModeratorId) {
      whereClause.case = {
        assignedModeratorId: filters.assignedModeratorId,
      };
    }

    return this.prisma.report.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
          },
        },
        evidence: true,
        case: true,
      },
    });
  }

  async findReportsByReporter(reporterId: string) {
    return this.prisma.report.findMany({
      where: { reporterId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        evidence: true,
        case: true,
      },
    });
  }

  async deleteReport(id: string) {
    return this.prisma.report.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findReasonByCode(code: string) {
    return this.prisma.reportReason.findUnique({
      where: { code, isActive: true },
    });
  }

  async findActiveReasons() {
    return this.prisma.reportReason.findMany({
      where: { isActive: true },
    });
  }

  async createReason(data: Prisma.ReportReasonCreateInput) {
    return this.prisma.reportReason.create({ data });
  }

  async createCase(data: Prisma.ModerationCaseUncheckedCreateInput) {
    return this.prisma.moderationCase.create({ data });
  }

  async updateCase(id: string, data: Prisma.ModerationCaseUncheckedUpdateInput) {
    return this.prisma.moderationCase.update({
      where: { id },
      data,
    });
  }

  async findCaseById(id: string) {
    return this.prisma.moderationCase.findUnique({
      where: { id },
      include: {
        assignedModerator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        reports: {
          include: { evidence: true, reporter: { select: { email: true } } },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          include: { moderator: { select: { email: true } } },
        },
        actions: true,
        assignments: {
          orderBy: { assignedAt: 'desc' },
          include: { moderator: { select: { email: true } } },
        },
      },
    });
  }

  async countOpenReports() {
    return this.prisma.report.count({
      where: { status: 'OPEN', deletedAt: null },
    });
  }

  async countAssignedCases(moderatorId: string) {
    return this.prisma.moderationCase.count({
      where: { assignedModeratorId: moderatorId, status: 'ASSIGNED', deletedAt: null },
    });
  }
}
