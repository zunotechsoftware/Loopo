import { Controller, Post, Get, Body, Param, UseGuards, Req, HttpCode, HttpStatus, Headers } from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { VerifyPaymentDto } from '../dto/verify-payment.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('payments.manage')
  @ApiOperation({ summary: 'Create a new payment intent/order' })
  @ApiResponse({ status: 201, description: 'Payment intent created successfully' })
  @Post('create')
  async createPayment(
    @CurrentUser() user: any,
    @Body() dto: CreatePaymentDto,
    @Req() req: any,
  ) {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    return this.paymentsService.createPayment(user.id, dto, ipAddress, userAgent);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('payments.manage')
  @ApiOperation({ summary: 'Verify and capture payment completion' })
  @ApiResponse({ status: 200, description: 'Payment status verified successfully' })
  @HttpCode(HttpStatus.OK)
  @Post('verify')
  async verifyPayment(
    @CurrentUser() user: any,
    @Body() dto: VerifyPaymentDto,
    @Req() req: any,
  ) {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    return this.paymentsService.verifyPayment(user.id, dto, ipAddress, userAgent);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('payments.view')
  @ApiOperation({ summary: 'Get current user payment history' })
  @ApiResponse({ status: 200, description: 'List of payments retrieved' })
  @Get('history')
  async getPaymentHistory(@CurrentUser() user: any) {
    return this.paymentsService.getPaymentHistory(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('payments.view')
  @ApiOperation({ summary: 'Get payment record by ID' })
  @ApiResponse({ status: 200, description: 'Payment record retrieved' })
  @Get(':id')
  async getPaymentById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.paymentsService.getPaymentById(user.id, id);
  }

  @ApiOperation({ summary: 'Provider webhooks signature handler (Stripe/PayPal/Razorpay)' })
  @ApiResponse({ status: 200, description: 'Webhook acknowledged' })
  @HttpCode(HttpStatus.OK)
  @Post('webhook/:provider')
  async handleWebhook(
    @Param('provider') provider: string,
    @Body() rawBody: any,
    @Headers() headers: Record<string, string>,
  ) {
    // rawBody is passed as buffer or text by custom configurations if needed.
    // If parsed as JSON by Nest, we re-serialize or parse directly.
    const bodyString = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);
    return this.paymentsService.handleWebhook(provider.toUpperCase(), bodyString, headers);
  }
}
