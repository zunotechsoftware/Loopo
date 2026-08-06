import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ReportsService } from '../services/reports.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Client Reports')
@Controller('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Permissions('reports.create')
  @ApiOperation({ summary: 'Submit a new report against content (listings/users/chats)' })
  @ApiResponse({ status: 201, description: 'Report filed successfully' })
  @Post()
  async createReport(@CurrentUser() user: any, @Body() dto: CreateReportDto) {
    return this.reportsService.createReport(user.id, dto);
  }

  @Permissions('reports.view')
  @ApiOperation({ summary: 'Get current user submitted reports history' })
  @ApiResponse({ status: 200, description: 'List of reports filed by current user' })
  @Get('me')
  async getMyReports(@CurrentUser() user: any) {
    return this.reportsService.getMyReports(user.id);
  }

  @Permissions('reports.view')
  @ApiOperation({ summary: 'Get detailed report by ID (restricted to reporter)' })
  @ApiResponse({ status: 200, description: 'Report details payload' })
  @Get(':id')
  async getReportById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.reportsService.getReportById(user.id, id);
  }

  @Permissions('reports.delete')
  @ApiOperation({ summary: 'Delete/withdraw a report (restricted to reporter)' })
  @ApiResponse({ status: 200, description: 'Report successfully withdrawn' })
  @Delete(':id')
  async deleteReport(@CurrentUser() user: any, @Param('id') id: string) {
    return this.reportsService.deleteReport(user.id, id);
  }
}
