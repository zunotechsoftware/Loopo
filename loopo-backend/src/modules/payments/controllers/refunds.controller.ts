import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { CreateRefundDto } from '../dto/create-refund.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin Refunds')
@Controller('admin/refunds')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class RefundsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Permissions('payments.manage')
  @ApiOperation({ summary: 'Initiate a refund for a payment (Admin only)' })
  @ApiResponse({ status: 201, description: 'Refund processed successfully' })
  @Post()
  async processRefund(
    @CurrentUser() adminUser: any,
    @Body() dto: CreateRefundDto,
    @Req() req: any,
  ) {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    return this.paymentsService.processRefund(adminUser.id, dto, ipAddress, userAgent);
  }

  @Permissions('payments.view')
  @ApiOperation({ summary: 'Get history of refunds (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of refunds' })
  @Get()
  async getRefundHistory() {
    return this.paymentsService.getRefundHistory();
  }
}
