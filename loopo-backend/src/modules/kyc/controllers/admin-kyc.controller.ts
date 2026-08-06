import { Controller, Get, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { KycService } from '../services/kyc.service';
import { RejectKycDto } from '../dto/kyc.dto';
import { KycStatus } from '@prisma/client';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { LogAudit } from '../../../shared/common/decorators/audit-log.decorator';

@ApiTags('Admin KYC')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('admin/kyc')
export class AdminKycController {
  constructor(private readonly kycService: KycService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('kyc.review')
  @ApiOperation({ summary: 'List and filter all user KYC applications' })
  @ApiQuery({ name: 'status', enum: KycStatus, required: false })
  @ApiQuery({ name: 'skip', type: Number, required: false })
  @ApiQuery({ name: 'take', type: Number, required: false })
  @ApiResponse({ status: 200, description: 'Applications listed successfully.' })
  async listKyc(
    @Query('status') status?: KycStatus,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    const skipVal = skip ? Number(skip) : undefined;
    const takeVal = take ? Number(take) : undefined;
    const list = await this.kycService.listKycApplications(status, skipVal, takeVal);
    return { message: 'KYC applications retrieved successfully', data: list };
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('kyc.review')
  @ApiOperation({ summary: 'Get details of a specific KYC application' })
  @ApiResponse({ status: 200, description: 'Application retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Application not found.' })
  async getKyc(@Param('id') id: string) {
    const kyc = await this.kycService.getKycById(id);
    return { message: 'KYC application retrieved successfully', data: kyc };
  }

  @Patch(':id/approve')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('kyc.review')
  @LogAudit('APPROVE_KYC', 'KycDocument')
  @ApiOperation({ summary: 'Approve a user\'s KYC application' })
  @ApiResponse({ status: 200, description: 'KYC application approved successfully.' })
  @ApiResponse({ status: 400, description: 'Application cannot be approved from current state.' })
  async approveKyc(@Param('id') id: string, @Request() req: any) {
    const kyc = await this.kycService.approveKyc(id, req.user.id);
    return { message: 'KYC application approved successfully', data: kyc };
  }

  @Patch(':id/reject')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('kyc.review')
  @LogAudit('REJECT_KYC', 'KycDocument')
  @ApiOperation({ summary: 'Reject a user\'s KYC application with remarks' })
  @ApiResponse({ status: 200, description: 'KYC application rejected successfully.' })
  @ApiResponse({ status: 400, description: 'Application cannot be rejected from current state.' })
  async rejectKyc(
    @Param('id') id: string,
    @Body() dto: RejectKycDto,
    @Request() req: any,
  ) {
    const kyc = await this.kycService.rejectKyc(id, req.user.id, dto.remarks);
    return { message: 'KYC application rejected successfully', data: kyc };
  }
}
