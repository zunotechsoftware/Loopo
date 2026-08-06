import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders.repository';
import { CreateOrderDto } from '../dto/order.dto';
import { PrismaService } from '../../../shared/database/prisma.service';
import { OrderStatus, ProductStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private readonly repository: OrdersRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createOrder(buyerId: string, dto: CreateOrderDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundException(`Product with ID ${dto.productId} not found`);
    }

    if (product.status !== ProductStatus.APPROVED) {
      throw new BadRequestException('This listing is not currently available for purchase.');
    }

    if (product.quantity < (dto.quantity || 1)) {
      throw new BadRequestException('Requested quantity is not available.');
    }

    if (product.sellerId === buyerId) {
      throw new BadRequestException('You cannot purchase your own listing.');
    }

    const quantity = dto.quantity || 1;
    const totalAmount = product.price * quantity;

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          buyerId,
          sellerId: product.sellerId,
          productId: product.id,
          quantity,
          price: product.price,
          totalAmount,
          currency: product.currency,
          status: OrderStatus.PENDING,
        },
        include: {
          product: true,
          buyer: { select: { id: true, firstName: true, lastName: true, email: true } },
          seller: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });

      const newQuantity = product.quantity - quantity;
      await tx.product.update({
        where: { id: product.id },
        data: {
          quantity: newQuantity,
          status: newQuantity === 0 ? ProductStatus.SOLD : product.status,
        },
      });

      const sellerProfile = await tx.sellerProfile.findUnique({
        where: { userId: product.sellerId },
      });

      if (sellerProfile) {
        await tx.sellerProfile.update({
          where: { userId: product.sellerId },
          data: {
            totalSales: {
              increment: 1,
            },
            trustScore: {
              increment: 2.0,
            },
          },
        });
      }

      return order;
    });
  }

  async getOrderDetails(id: string, userId: string, roles: string[]) {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const isAdmin = roles.includes('SUPER_ADMIN') || roles.includes('ADMIN');
    const isParty = order.buyerId === userId || order.sellerId === userId;

    if (!isParty && !isAdmin) {
      throw new ForbiddenException('You do not have permission to view this order.');
    }

    return order;
  }

  async getOrdersForBuyer(buyerId: string, skip?: number, take?: number) {
    return this.repository.findForBuyer(buyerId, skip, take);
  }

  async getOrdersForSeller(sellerId: string, skip?: number, take?: number) {
    return this.repository.findForSeller(sellerId, skip, take);
  }

  async updateOrderStatus(id: string, status: OrderStatus, userId: string, isAdmin = false) {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.sellerId !== userId && !isAdmin) {
      throw new ForbiddenException('You do not have permission to update this order.');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status },
        include: {
          product: true,
          buyer: { select: { id: true, firstName: true, lastName: true, email: true } },
          seller: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });

      if (status === OrderStatus.CANCELLED && !isAdmin) {
        const sellerProfile = await tx.sellerProfile.findUnique({
          where: { userId: order.sellerId },
        });

        if (sellerProfile) {
          await tx.sellerProfile.update({
            where: { userId: order.sellerId },
            data: {
              trustScore: {
                decrement: 5.0,
              },
            },
          });
        }
      }

      return updatedOrder;
    });
  }
}
