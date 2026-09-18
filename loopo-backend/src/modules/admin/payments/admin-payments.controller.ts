import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminPaymentsService } from './admin-payments.service';
import { RefundPaymentDto } from './dto/admin-payment.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';
import { PaymentStatus, RefundStatus } from '@prisma/client';

@ApiTags('Admin - Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('admin/payments')
export class AdminPaymentsController {
  constructor(private readonly adminPaymentsService: AdminPaymentsService) {}

  @Get()
  @Permissions('admin.payments.manage')
  @ApiOperation({ summary: 'Get all payments' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatus })
  async getPayments(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: PaymentStatus,
  ) {
    return this.adminPaymentsService.getAllPayments(
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
      status,
    );
  }

  // Must be registered before ':id' below - otherwise these literal segments
  // would be captured as an :id param and always 404/misbehave instead of
  // ever reaching their real handlers.
  @Get('subscriptions')
  @Permissions('admin.payments.manage')
  @ApiOperation({ summary: 'Get all seller subscriptions' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getSubscriptions(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
  ) {
    return this.adminPaymentsService.getAllSubscriptions(
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
      status,
    );
  }

  @Get('refunds')
  @Permissions('admin.payments.manage')
  @ApiOperation({ summary: 'Get all refunds' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: RefundStatus })
  async getRefunds(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: RefundStatus,
  ) {
    return this.adminPaymentsService.getAllRefunds(
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
      status,
    );
  }

  @Post('refunds')
  @Permissions('admin.payments.manage')
  @ApiOperation({ summary: 'Process a refund' })
  async refundPayment(
    @CurrentUser('id') adminId: string,
    @Body() dto: RefundPaymentDto,
  ) {
    return this.adminPaymentsService.refundPayment(adminId, dto);
  }

  @Get(':id')
  @Permissions('admin.payments.manage')
  @ApiOperation({ summary: 'Get payment by id' })
  async getPaymentById(@Param('id') id: string) {
    return this.adminPaymentsService.getPaymentById(id);
  }
}
