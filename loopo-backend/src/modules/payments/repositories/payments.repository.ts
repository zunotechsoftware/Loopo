import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentsRepository {
  constructor(public readonly prisma: PrismaService) {}

  async createPayment(data: Prisma.PaymentUncheckedCreateInput) {
    return this.prisma.payment.create({ data });
  }

  async updatePayment(id: string, data: Prisma.PaymentUpdateInput) {
    return this.prisma.payment.update({
      where: { id },
      data,
    });
  }

  async findPaymentById(id: string) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        provider: true,
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            firstName: true,
            lastName: true,
          },
        },
        transactions: true,
        refunds: true,
      },
    });
  }

  async findPaymentByOrderId(providerOrderId: string) {
    return this.prisma.payment.findUnique({
      where: { providerOrderId },
      include: { provider: true },
    });
  }

  async findPaymentByProviderPaymentId(providerPaymentId: string) {
    return this.prisma.payment.findUnique({
      where: { providerPaymentId },
      include: { provider: true },
    });
  }

  async findPaymentsByUser(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        provider: true,
        featuredPackage: true,
        boostPackage: true,
        coupon: true,
      },
    });
  }

  async createTransaction(data: Prisma.PaymentTransactionUncheckedCreateInput) {
    return this.prisma.paymentTransaction.create({ data });
  }

  async createRefund(data: Prisma.RefundUncheckedCreateInput) {
    return this.prisma.refund.create({ data });
  }

  async updateRefund(id: string, data: Prisma.RefundUpdateInput) {
    return this.prisma.refund.update({
      where: { id },
      data,
    });
  }

  async findRefundById(id: string) {
    return this.prisma.refund.findUnique({
      where: { id },
      include: { payment: true },
    });
  }

  async findRefunds() {
    return this.prisma.refund.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        payment: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async findProviderByCode(code: string) {
    return this.prisma.paymentProvider.findUnique({
      where: { code },
    });
  }

  async findFeaturedPackageById(id: string) {
    return this.prisma.featuredPackage.findUnique({
      where: { id },
    });
  }

  async findFeaturedPackages() {
    return this.prisma.featuredPackage.findMany({
      where: { isActive: true },
    });
  }

  async findBoostPackageById(id: string) {
    return this.prisma.boostPackage.findUnique({
      where: { id },
    });
  }

  async findBoostPackages() {
    return this.prisma.boostPackage.findMany({
      where: { isActive: true },
    });
  }

  async createUserBoost(data: Prisma.UserBoostUncheckedCreateInput) {
    return this.prisma.userBoost.create({ data });
  }

  async findCouponByCode(code: string) {
    return this.prisma.coupon.findUnique({
      where: { code, isActive: true },
    });
  }

  async createCouponRedemption(data: Prisma.CouponRedemptionUncheckedCreateInput) {
    return this.prisma.couponRedemption.create({ data });
  }

  async getUserCouponRedemptionsCount(userId: string, couponId: string) {
    return this.prisma.couponRedemption.count({
      where: { userId, couponId },
    });
  }

  async incrementCouponUsage(couponId: string) {
    return this.prisma.coupon.update({
      where: { id: couponId },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });
  }

  async createWebhookLog(data: Prisma.PaymentWebhookUncheckedCreateInput) {
    return this.prisma.paymentWebhook.create({ data });
  }

  async findWebhookLogByProviderEvent(provider: string, providerEventId: string) {
    return this.prisma.paymentWebhook.findFirst({
      where: { provider, providerEventId },
    });
  }

  async updateWebhookLog(id: string, data: Prisma.PaymentWebhookUpdateInput) {
    return this.prisma.paymentWebhook.update({
      where: { id },
      data,
    });
  }

  async createAuditLog(data: Prisma.PaymentAuditLogUncheckedCreateInput) {
    return this.prisma.paymentAuditLog.create({ data });
  }
}
