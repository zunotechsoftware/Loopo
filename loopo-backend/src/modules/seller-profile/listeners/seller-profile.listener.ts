import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SellerProfileRepository } from '../repositories/seller-profile.repository';
import { PrismaService } from '../../../shared/database/prisma.service';

@Injectable()
export class SellerProfileListener {
  private readonly logger = new Logger(SellerProfileListener.name);

  constructor(
    private readonly repository: SellerProfileRepository,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('product.created')
  async handleProductCreated(event: { productId: string; sellerId: string; title: string }) {
    const { sellerId } = event;
    this.logger.log(`Handling product.created event for seller ${sellerId}`);

    try {
      // Check if seller profile already exists
      const existingProfile = await this.repository.findByUserId(sellerId);
      if (existingProfile) {
        await this.repository.incrementListingsCount(sellerId);
        this.logger.log(`Seller profile already exists for user ${sellerId}. Incremented listing count.`);
        return;
      }

      // If not, fetch User profile to populate basic info
      const userProfile = await this.prisma.profile.findUnique({
        where: { userId: sellerId },
      });

      const user = await this.prisma.user.findUnique({
        where: { id: sellerId },
      });

      const displayName = userProfile?.displayName || 
        (userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim() : null) || 
        user?.email?.split('@')[0] || 
        'Marketplace Seller';

      // Create new Seller Profile
      await this.repository.create({
        userId: sellerId,
        displayName,
        bio: userProfile?.bio || 'Welcome to my seller store!',
        profileImage: userProfile?.coverImageId || null, // placeholder profile image or cover
        verificationStatus: 'PENDING',
        kycStatus: 'DRAFT',
        trustScore: 50.0,
        sellerRating: 0.0,
        totalSales: 0,
        totalListings: 1, // first product created
        responseRate: 100.0,
        averageResponseTime: 0.0,
      });

      // Create user seller stats if they don't exist
      await this.prisma.sellerStatistics.upsert({
        where: { userId: sellerId },
        update: {},
        create: {
          userId: sellerId,
          averageRating: 0.0,
          totalReviews: 0,
          positivePercent: 0.0,
          negativePercent: 0.0,
          recentTrend: 0.0,
        },
      });

      this.logger.log(`Automatically created seller profile for user ${sellerId} after first product creation.`);
    } catch (error) {
      this.logger.error(`Failed to handle product.created event for user ${sellerId}`, error);
    }
  }
}
