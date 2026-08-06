import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SellerProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    return this.prisma.sellerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async create(data: Prisma.SellerProfileUncheckedCreateInput) {
    return this.prisma.sellerProfile.create({
      data,
    });
  }

  async update(userId: string, data: Prisma.SellerProfileUpdateInput) {
    return this.prisma.sellerProfile.update({
      where: { userId },
      data,
    });
  }

  async incrementListingsCount(userId: string) {
    return this.prisma.sellerProfile.update({
      where: { userId },
      data: {
        totalListings: {
          increment: 1,
        },
      },
    });
  }

  async decrementListingsCount(userId: string) {
    return this.prisma.sellerProfile.update({
      where: { userId },
      data: {
        totalListings: {
          decrement: 1,
        },
      },
    });
  }
}
