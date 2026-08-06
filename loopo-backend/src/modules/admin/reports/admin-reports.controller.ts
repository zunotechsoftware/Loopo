import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminReportsService } from './admin-reports.service';
import { ResolveReportDto, UpdateReportStatusDto } from './dto/admin-report.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';
import { ReportStatus } from '@prisma/client';

@ApiTags('Admin - Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('api/v1/admin/reports')
export class AdminReportsController {
  constructor(private readonly reportsService: AdminReportsService) {}

  @Get()
  @Permissions('admin.reports.manage')
  @ApiOperation({ summary: 'Get all reports' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ReportStatus })
  async getReports(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: ReportStatus,
  ) {
    return this.reportsService.getAllReports(
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
      status,
    );
  }

  @Get(':id')
  @Permissions('admin.reports.manage')
  @ApiOperation({ summary: 'Get report by id' })
  async getReportById(@Param('id') id: string) {
    return this.reportsService.getReportById(id);
  }

  @Patch(':id/resolve')
  @Permissions('admin.reports.manage')
  @ApiOperation({ summary: 'Resolve a report' })
  async resolveReport(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: ResolveReportDto,
  ) {
    return this.reportsService.resolveReport(id, adminId, dto);
  }

  @Patch(':id/status')
  @Permissions('admin.reports.manage')
  @ApiOperation({ summary: 'Update report status' })
  async updateReportStatus(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: UpdateReportStatusDto,
  ) {
    return this.reportsService.updateReportStatus(id, adminId, dto);
  }
}
