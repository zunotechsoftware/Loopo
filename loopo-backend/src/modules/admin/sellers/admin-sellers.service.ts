import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { AdminSellerQueryDto } from './dto/admin-seller.dto';
import { KycStatus } from '@prisma/client';

@Injectable()
export class AdminSellersService {
  constructor(private readonly prisma: PrismaService) {}

  async listSellers(query: AdminSellerQueryDto) {
    const { search, verificationStatus, kycStatus, skip, take } = query;
    const where: any = {};

    if (verificationStatus) {
      where.verificationStatus = verificationStatus;
    }

    if (kycStatus) {
      where.kycStatus = kycStatus as KycStatus;
    }

    if (search) {
      where.OR = [
        { displayName: { contains: search, mode: 'insensitive' } },
        { storeName: { contains: search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.sellerProfile.findMany({
        where,
        skip,
        take,
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
              sellerStatistics: true,
              products: {
                include: {
                  category: true,
                  location: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.sellerProfile.count({ where }),
    ]);

    return { data, total };
  }

  async getSellerById(id: string) {
    const seller = await this.prisma.sellerProfile.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            profile: true,
            kycDocuments: true,
            sellerStatistics: true,
            userSubscription: { include: { plan: true } },
          },
        },
      },
    });

    if (!seller) {
      throw new NotFoundException(`Seller profile with ID ${id} not found`);
    }

    return seller;
  }

  async verifySeller(id: string) {
    await this.getSellerById(id);

    return this.prisma.sellerProfile.update({
      where: { id },
      data: {
        verificationStatus: 'VERIFIED',
      },
    });
  }

  async suspendSeller(id: string) {
    await this.getSellerById(id);

    return this.prisma.sellerProfile.update({
      where: { id },
      data: {
        verificationStatus: 'SUSPENDED',
      },
    });
  }

  async approveKyc(id: string) {
    const seller = await this.getSellerById(id);

    const activeKyc = await this.prisma.kycDocument.findFirst({
      where: { userId: seller.userId, status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'DRAFT'] } },
      orderBy: { createdAt: 'desc' },
    });

    if (activeKyc) {
      await this.prisma.kycDocument.update({
        where: { id: activeKyc.id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
        },
      });
    }

    return this.prisma.sellerProfile.update({
      where: { id },
      data: {
        kycStatus: 'APPROVED',
        verificationStatus: 'VERIFIED',
        trustScore: {
          increment: 15.0,
        },
      },
    });
  }
}
