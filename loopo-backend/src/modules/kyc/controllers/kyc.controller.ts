import { Controller, Get, Post, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { KycService } from '../services/kyc.service';
import { CreateKycDto, UpdateKycDto } from '../dto/kyc.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';

@ApiTags('KYC')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Get('me')
  @Roles('SUPER_ADMIN', 'ADMIN', 'USER')
  @ApiOperation({ summary: 'Get current user\'s KYC application details' })
  @ApiResponse({ status: 200, description: 'KYC application details retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'No KYC submission found.' })
  async getMyKyc(@Request() req: any) {
    const kyc = await this.kycService.getMyKyc(req.user.id);
    return { message: 'KYC status retrieved successfully', data: kyc };
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'USER')
  @ApiOperation({ summary: 'Submit KYC application (Draft or Submitted)' })
  @ApiResponse({ status: 201, description: 'KYC application created successfully.' })
  @ApiResponse({ status: 400, description: 'Active application already exists.' })
  async submitKyc(@Body() dto: CreateKycDto, @Request() req: any) {
    const kyc = await this.kycService.submitKyc(req.user.id, dto);
    return { message: 'KYC application submitted successfully', data: kyc };
  }

  @Put()
  @Roles('SUPER_ADMIN', 'ADMIN', 'USER')
  @ApiOperation({ summary: 'Update a draft or rejected KYC application' })
  @ApiResponse({ status: 200, description: 'KYC application updated successfully.' })
  @ApiResponse({ status: 400, description: 'Application cannot be edited in current state.' })
  async updateKyc(@Body() dto: UpdateKycDto, @Request() req: any) {
    const kyc = await this.kycService.updateKyc(req.user.id, dto);
    return { message: 'KYC application updated successfully', data: kyc };
  }
}
