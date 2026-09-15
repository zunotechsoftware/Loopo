import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuditLogsService } from '../../audit-logs/services/audit-logs.service';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';

@ApiTags('Admin - Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('admin/audit-logs')
export class AdminAuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Permissions('admin.audit-logs.view')
  @ApiOperation({ summary: 'List audit log entries (who did what, when)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'entity', required: false })
  async getLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('entity') entity?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page || '1', 10) || 1);
    const take = Math.min(200, Math.max(1, parseInt(limit || '25', 10) || 25));
    const skip = (pageNum - 1) * take;

    const { items, total } = await this.auditLogsService.getLogs({ skip, take, userId, action, entity });
    return { message: 'Audit logs retrieved successfully', data: { items, total, page: pageNum, limit: take } };
  }

  @Get('export')
  @Permissions('admin.audit-logs.view')
  @ApiOperation({ summary: 'Export audit logs as CSV (most recent 1000 entries matching the filters)' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'entity', required: false })
  async exportLogs(
    @Res() res: Response,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('entity') entity?: string,
  ) {
    const { items } = await this.auditLogsService.getLogs({ skip: 0, take: 1000, userId, action, entity });

    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = ['Timestamp', 'Admin', 'Action', 'Entity', 'Entity ID', 'IP Address'];
    const rows = items.map((log: any) => [
      new Date(log.createdAt).toISOString(),
      log.user ? `${log.user.firstName || ''} ${log.user.lastName || ''}`.trim() || log.user.email : 'System',
      log.action,
      log.entity,
      log.entityId || '',
      log.ipAddress || '',
    ]);
    const csv = [header, ...rows].map((r) => r.map(escape).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`);
    res.send(csv);
  }
}
