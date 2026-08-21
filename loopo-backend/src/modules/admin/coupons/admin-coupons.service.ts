import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupons.dto';

@Injectable()
export class AdminCouponsService {
  constructor(private prisma: PrismaService) {}

  async getAllCoupons() {
    return this.prisma.coupon.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCouponById(id: string) {
    const coupon = await this.prisma.coupon.findFirst({
      where: { id, deletedAt: null },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  async createCoupon(dto: CreateCouponDto) {
    // Check if code already exists
    const existing = await this.prisma.coupon.findUnique({
      where: { code: dto.code }
    });

    if (existing && !existing.deletedAt) {
      throw new ConflictException('Coupon code already exists');
    }

    // If it exists but is deleted, we can't easily reuse the code without complex logic 
    // due to unique constraint on code. For simplicity, just enforce strict uniqueness.
    if (existing) {
       throw new ConflictException('Coupon code was previously used and deleted. Please use a different code.');
    }

    return this.prisma.coupon.create({
      data: dto,
    });
  }

  async updateCoupon(id: string, dto: UpdateCouponDto) {
    const coupon = await this.getCouponById(id);

    // Check code uniqueness if changing code
    if (dto.code && dto.code !== coupon.code) {
      const existing = await this.prisma.coupon.findUnique({
        where: { code: dto.code }
      });
      if (existing) {
        throw new ConflictException('Coupon code already exists');
      }
    }

    return this.prisma.coupon.update({
      where: { id: coupon.id },
      data: dto,
    });
  }

  async deleteCoupon(id: string) {
    const coupon = await this.getCouponById(id);

    return this.prisma.coupon.update({
      where: { id: coupon.id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }
}
