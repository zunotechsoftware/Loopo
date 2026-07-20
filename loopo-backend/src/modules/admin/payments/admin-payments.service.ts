import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { RefundPaymentDto } from './dto/admin-payment.dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class AdminPaymentsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async refundPayment(adminId: string, dto: RefundPaymentDto) {
    const payment = await this.getPaymentById(dto.paymentId);

    if (payment.status !== 'SUCCESS' && payment.status !== 'PARTIALLY_REFUNDED') {
      throw new BadRequestException('Only successful payments can be refunded');
    }

    const totalRefunded = payment.refunds
      .filter((r) => r.status === 'SUCCESS')
      .reduce((sum, r) => sum + r.amount, 0);

    if (totalRefunded + dto.amount > payment.netAmount) {
      throw new BadRequestException('Refund amount exceeds total paid amount');
    }

    return this.prisma.$transaction(async (tx) => {
      const refund = await tx.refund.create({
        data: {
          paymentId: payment.id,
          amount: dto.amount,
          reason: dto.reason,
          createdById: adminId,
          status: 'SUCCESS', // Mock successful refund for now
        },
      });

      const newStatus = totalRefunded + dto.amount >= payment.netAmount 
        ? 'REFUNDED' 
        : 'PARTIALLY_REFUNDED';

      await tx.payment.update({
        where: { id: payment.id },
        data: { status: newStatus },
      });

      return refund;
    });
  }
}
