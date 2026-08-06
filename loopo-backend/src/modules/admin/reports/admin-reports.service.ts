import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { ResolveReportDto, UpdateReportStatusDto } from './dto/admin-report.dto';
import { ReportStatus, ModerationActionType } from '@prisma/client';

@Injectable()
export class AdminReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllReports(skip: number = 0, take: number = 20, status?: ReportStatus) {
    const where: any = { deletedAt: null };
    if (status) where.status = status;
    
    return this.prisma.report.findMany({
      where,
      skip,
      take,
      include: {
        reporter: { select: { id: true, firstName: true, lastName: true, email: true } },
        reason: true,
        case: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReportById(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        reporter: true,
        reason: true,
        evidence: true,
        case: {
          include: {
            assignedModerator: { select: { id: true, firstName: true, lastName: true } },
            notes: true,
            actions: true,
          }
        },
      },
    });

    if (!report) throw new NotFoundException(`Report ${id} not found`);
    return report;
  }

  async resolveReport(id: string, adminId: string, dto: ResolveReportDto) {
    const report = await this.getReportById(id);

    return this.prisma.$transaction(async (tx) => {
      // 1. Mark report as resolved
      const updatedReport = await tx.report.update({
        where: { id },
        data: { status: 'RESOLVED' },
      });

      // 2. If it belongs to a case, add a note and optionally an action
      if (report.caseId) {
        await tx.moderationNote.create({
          data: {
            caseId: report.caseId,
            moderatorId: adminId,
            note: dto.note,
          },
        });

        if (dto.actionType) {
          await tx.moderationAction.create({
            data: {
              caseId: report.caseId,
              moderatorId: adminId,
              actionType: dto.actionType,
              targetType: report.targetType,
              targetId: report.targetId,
              reason: dto.note,
            },
          });
        }
      }

      return updatedReport;
    });
  }

  async updateReportStatus(id: string, adminId: string, dto: UpdateReportStatusDto) {
    await this.getReportById(id);

    return this.prisma.report.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}
