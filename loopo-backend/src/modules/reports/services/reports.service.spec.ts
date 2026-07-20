import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { ReportsRepository } from '../repositories/reports.repository';
import { getQueueToken } from '@nestjs/bullmq';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReportStatus, PriorityLevel, ReportTargetType } from '@prisma/client';

describe('ReportsService', () => {
  let service: ReportsService;
  let repository: ReportsRepository;

  const mockEvidenceQueue = { add: jest.fn().mockResolvedValue({}) };
  const mockAiQueue = { add: jest.fn().mockResolvedValue({}) };
  const mockNotificationsQueue = { add: jest.fn().mockResolvedValue({}) };

  const mockReportsRepository = {
    findReasonByCode: jest.fn(),
    createReport: jest.fn(),
    createCase: jest.fn(),
    updateCase: jest.fn(),
    findReportById: jest.fn(),
    findReportsByReporter: jest.fn(),
    findReports: jest.fn(),
    deleteReport: jest.fn(),
    prisma: {
      report: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      caseAssignment: {
        create: jest.fn(),
      },
      moderationCase: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      moderationNote: {
        create: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: ReportsRepository, useValue: mockReportsRepository },
        { provide: getQueueToken('evidence-processing'), useValue: mockEvidenceQueue },
        { provide: getQueueToken('ai-moderation'), useValue: mockAiQueue },
        { provide: getQueueToken('report-notifications'), useValue: mockNotificationsQueue },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    repository = module.get<ReportsRepository>(ReportsRepository);

    jest.clearAllMocks();
  });

  describe('createReport', () => {
    const mockDto = {
      targetType: 'LISTING' as any,
      targetId: 'target-uuid',
      reasonCode: 'SPAM',
      details: 'Spam listing details',
    };

    it('should throw BadRequestException if reason code is invalid', async () => {
      mockReportsRepository.findReasonByCode.mockResolvedValue(null);

      await expect(service.createReport('user-uuid', mockDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if active report already exists against target', async () => {
      mockReportsRepository.findReasonByCode.mockResolvedValue({ code: 'SPAM' });
      mockReportsRepository.prisma.report.findFirst.mockResolvedValue({ id: 'existing-report' });

      await expect(service.createReport('user-uuid', mockDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should successfully create report, create new case if none exists, and add tasks to queues', async () => {
      mockReportsRepository.findReasonByCode.mockResolvedValue({ code: 'SPAM' });
      mockReportsRepository.prisma.report.findFirst.mockResolvedValue(null);
      mockReportsRepository.prisma.moderationCase.findFirst.mockResolvedValue(null);
      mockReportsRepository.createCase.mockResolvedValue({ id: 'new-case-id' });
      mockReportsRepository.createReport.mockResolvedValue({ id: 'report-id' });

      const result = await service.createReport('user-uuid', mockDto);

      expect(repository.createCase).toHaveBeenCalled();
      expect(repository.createReport).toHaveBeenCalledWith(
        expect.objectContaining({
          reporterId: 'user-uuid',
          targetId: 'target-uuid',
          caseId: 'new-case-id',
        }),
        [],
      );
      expect(mockAiQueue.add).toHaveBeenCalledWith('analyze-report', { reportId: 'report-id' });
      expect(mockNotificationsQueue.add).toHaveBeenCalledWith('send-report-filed', {
        reportId: 'report-id',
        reporterId: 'user-uuid',
      });
      expect(result).toEqual({ id: 'report-id' });
    });
  });

  describe('assignReport', () => {
    it('should assign moderator to case and update report status', async () => {
      const reportMock = { id: 'report-id', caseId: 'case-id' };
      mockReportsRepository.findReportById.mockResolvedValue(reportMock);
      mockReportsRepository.prisma.report.update.mockResolvedValue({});

      await service.assignReport('admin-uuid', 'report-id', 'moderator-uuid');

      expect(repository.updateCase).toHaveBeenCalledWith('case-id', {
        assignedModeratorId: 'moderator-uuid',
        status: ReportStatus.ASSIGNED,
      });
      expect(repository.prisma.caseAssignment.create).toHaveBeenCalled();
      expect(repository.prisma.report.update).toHaveBeenCalledWith({
        where: { id: 'report-id' },
        data: { status: ReportStatus.ASSIGNED },
      });
    });
  });

  describe('escalateReport', () => {
    it('should escalate case to critical priority and record escalation note', async () => {
      const reportMock = { id: 'report-id', caseId: 'case-id' };
      mockReportsRepository.findReportById.mockResolvedValue(reportMock);

      await service.escalateReport('admin-uuid', 'report-id', 'Abusive content escalation');

      expect(repository.updateCase).toHaveBeenCalledWith('case-id', {
        status: ReportStatus.ESCALATED,
        priority: PriorityLevel.CRITICAL,
      });
      expect(repository.prisma.moderationNote.create).toHaveBeenCalledWith({
        data: {
          caseId: 'case-id',
          moderatorId: 'admin-uuid',
          note: '[ESCALATION NOTE] Abusive content escalation',
        },
      });
    });
  });
});
