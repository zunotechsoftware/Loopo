import { Injectable } from '@nestjs/common';
import { AuditLogsRepository } from '../repositories/audit-logs.repository';

@Injectable()
export class AuditLogsService {
  constructor(private readonly auditLogsRepository: AuditLogsRepository) {}

  async logAction(data: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    ipAddress?: string;
    userAgent?: string;
    oldValues?: any;
    newValues?: any;
    createdBy?: string;
  }) {
    try {
      await this.auditLogsRepository.create(data);
    } catch (error) {
      // Prevent failure in logging from breaking main transaction
      console.error('AuditLog failure:', error);
    }
  }

  async getLogs(params: {
    skip?: number;
    take?: number;
    userId?: string;
    action?: string;
    entity?: string;
  }) {
    const where: any = {};
    if (params.userId) where.userId = params.userId;
    if (params.action) where.action = params.action;
    if (params.entity) where.entity = params.entity;

    return this.auditLogsRepository.findMany({
      skip: params.skip,
      take: params.take,
      where,
    });
  }
}
