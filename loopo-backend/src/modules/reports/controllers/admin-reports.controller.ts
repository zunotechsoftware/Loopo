import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from '../services/reports.service';
import { ReportQueryDto } from '../dto/report-query.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportStatus, PriorityLevel } from '@prisma/client';

@ApiTags('Admin Reports')
@Controller('admin/reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class AdminReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Permissions('reports.view')
  @ApiOperation({ summary: 'List all reports filed across the system with optional filters' })
  @ApiResponse({ status: 200, description: 'Filtered report items list' })
  @Get()
  async getAdminReports(@Query() query: ReportQueryDto) {
    return this.reportsService.getAdminReports(query);
  }

  @Permissions('reports.view')
  @ApiOperation({ summary: 'Get details of any report by ID' })
  @ApiResponse({ status: 200, description: 'Detailed report payload' })
  @Get(':id')
  async getAdminReportById(@Param('id') id: string) {
    return this.reportsService.getAdminReportById(id);
  }

  @Permissions('reports.assign')
  @ApiOperation({ summary: 'Assign a report case to a specific moderator' })
  @ApiResponse({ status: 200, description: 'Assigned successfully' })
  @Patch(':id/assign')
  async assignReport(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('moderatorId') moderatorId: string,
  ) {
    return this.reportsService.assignReport(user.id, id, moderatorId);
  }

  @Permissions('reports.resolve')
  @ApiOperation({ summary: 'Update report/case status and priority level' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ReportStatus,
    @Body('priority') priority?: PriorityLevel,
  ) {
    return this.reportsService.updateReportStatus(id, status, priority);
  }

  @Permissions('reports.resolve')
  @ApiOperation({ summary: 'Escalate a report priority to Critical and add context note' })
  @ApiResponse({ status: 200, description: 'Escalation recorded successfully' })
  @Patch(':id/escalate')
  async escalateReport(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('note') note: string,
  ) {
    return this.reportsService.escalateReport(user.id, id, note);
  }

  @Permissions('reports.resolve')
  @ApiOperation({ summary: 'Mark report status as RESOLVED' })
  @ApiResponse({ status: 200, description: 'Report status updated to RESOLVED' })
  @Patch(':id/resolve')
  async resolveReport(@Param('id') id: string) {
    return this.reportsService.updateReportStatus(id, ReportStatus.RESOLVED);
  }

  @Permissions('reports.resolve')
  @ApiOperation({ summary: 'Mark report status as REJECTED' })
  @ApiResponse({ status: 200, description: 'Report status updated to REJECTED' })
  @Patch(':id/reject')
  async rejectReport(@Param('id') id: string) {
    return this.reportsService.updateReportStatus(id, ReportStatus.REJECTED);
  }
}
