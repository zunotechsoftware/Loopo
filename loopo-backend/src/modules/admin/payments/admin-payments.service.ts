import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { RefundPaymentDto } from './dto/admin-payment.dto';
import { PaymentStatus, RefundStatus } from '@prisma/client';
import { PaymentsService } from '../../payments/services/payments.service';

@Injectable()
export class AdminPaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async getAllPayments(skip: number = 0, take: number = 20, status?: PaymentStatus) {
    const where: any = { deletedAt: null };
    if (status) where.status = status;
    
    return this.prisma.payment.findMany({
      where,
      skip,
      take,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        provider: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Real seller subscriptions (SubscriptionPlan/Subscription models) - there
   * was previously no admin-facing list at all, only the user-self-service
   * subscribe/cancel/current endpoints in the subscriptions module. */
  async getAllSubscriptions(skip: number = 0, take: number = 20, status?: string) {
    const where: any = { deletedAt: null };
    if (status) where.status = status;

    return this.prisma.subscription.findMany({
      where,
      skip,
      take,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Refunds don't have a dedicated admin list endpoint either - only
   * POST .../refunds to create one. */
  async getAllRefunds(skip: number = 0, take: number = 20, status?: RefundStatus) {
    const where: any = {};
    if (status) where.status = status;

    return this.prisma.refund.findMany({
      where,
      skip,
      take,
      include: {
        payment: {
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPaymentById(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        user: true,
        provider: true,
        transactions: true,
        refunds: true,
      },
    });

    if (!payment) throw new NotFoundException(`Payment ${id} not found`);
    return payment;
  }

  /**
   * Delegates to the real, gateway-calling PaymentsService.processRefund()
   * (used by POST /admin/refunds) instead of writing a Refund row directly.
   * This used to hardcode `status: 'SUCCESS'` with no provider call at all -
   * money never actually moved. Kept as a thin wrapper (rather than deleting
   * this endpoint) so existing admin-panel callers of
   * POST /admin/payments/refunds keep working unchanged.
   */
  async refundPayment(adminId: string, dto: RefundPaymentDto, ipAddress?: string, userAgent?: string) {
    return this.paymentsService.processRefund(
      adminId,
      { paymentId: dto.paymentId, amount: dto.amount, reason: dto.reason },
      ipAddress,
      userAgent,
    );
  }
}
