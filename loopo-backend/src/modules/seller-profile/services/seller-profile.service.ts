import { Injectable, NotFoundException } from '@nestjs/common';
import { SellerProfileRepository } from '../repositories/seller-profile.repository';
import { UpdateSellerProfileDto } from '../dto/seller-profile.dto';
import { PrismaService } from '../../../shared/database/prisma.service';

@Injectable()
export class SellerProfileService {
  constructor(
    private readonly repository: SellerProfileRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getProfile(userId: string) {
    const profile = await this.repository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Seller profile not found. Please create a listing to register as a seller.');
    }
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateSellerProfileDto) {
    // Verify profile exists
    await this.getProfile(userId);
    return this.repository.update(userId, dto);
  }

  async getStatistics(userId: string) {
    const profile = await this.getProfile(userId);
    return {
      trustScore: profile.trustScore,
      sellerRating: profile.sellerRating,
      totalSales: profile.totalSales,
      totalListings: profile.totalListings,
      responseRate: profile.responseRate,
      averageResponseTime: profile.averageResponseTime,
    };
  }

  async getSubscription(userId: string) {
    const sub = await this.prisma.userSubscription.findUnique({
      where: { userId },
      include: {
        plan: true,
      },
    });
    if (!sub) {
      return {
        plan: {
          name: 'Free',
        },
        maxListings: 5,
        featuredListings: 0,
        boostCredits: 0,
        imageLimits: 5,
        videoUpload: false,
        prioritySupport: false,
        analyticsAccess: false,
        chatLimits: 100,
        expiresAt: null,
      };
    }
    return sub;
  }
}
