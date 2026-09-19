import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { UserNotificationsService } from '../../user-notifications/services/user-notifications.service';
import { CreateOfferDto } from '../dto/offer.dto';
import { OfferStatus, ProductStatus } from '@prisma/client';

const PRODUCT_SUMMARY = {
  select: {
    id: true,
    title: true,
    slug: true,
    price: true,
    currency: true,
    status: true,
    images: { take: 1, orderBy: { createdAt: 'asc' as const }, select: { originalUrl: true, thumbnailUrl: true } },
  },
};

const USER_SUMMARY = {
  select: { id: true, firstName: true, lastName: true, profileImage: true },
};

@Injectable()
export class OffersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userNotifications: UserNotificationsService,
  ) {}

  /// A buyer proposing a price on a live listing - the real backend behind
  /// what was previously two independent, fully hardcoded "Offers" screens
  /// (loopo-client and loopo-flutter) with no persistence at all.
  async createOffer(buyerId: string, dto: CreateOfferDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product || product.deletedAt) {
      throw new NotFoundException('Listing not found');
    }
    if (product.status !== ProductStatus.APPROVED) {
      throw new BadRequestException('This listing is not open for offers');
    }
    if (product.sellerId === buyerId) {
      throw new BadRequestException('You cannot make an offer on your own listing');
    }

    const offer = await this.prisma.offer.create({
      data: {
        productId: product.id,
        buyerId,
        sellerId: product.sellerId,
        amount: dto.amount,
        message: dto.message,
      },
      include: { product: PRODUCT_SUMMARY, buyer: USER_SUMMARY, seller: USER_SUMMARY },
    });

    const buyerName = `${offer.buyer.firstName || ''} ${offer.buyer.lastName || ''}`.trim() || 'A buyer';
    await this.userNotifications.notifyUser(product.sellerId, {
      type: 'OFFER_RECEIVED',
      title: 'New offer on your listing',
      message: `${buyerName} offered ${product.currency} ${dto.amount} for "${product.title}".`,
      link: `/offers`,
      metadata: { offerId: offer.id, productId: product.id },
    });

    return offer;
  }

  async getMadeOffers(buyerId: string) {
    return this.prisma.offer.findMany({
      where: { buyerId },
      include: { product: PRODUCT_SUMMARY, seller: USER_SUMMARY },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReceivedOffers(sellerId: string) {
    return this.prisma.offer.findMany({
      where: { sellerId },
      include: { product: PRODUCT_SUMMARY, buyer: USER_SUMMARY },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async findOwnedOffer(id: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: { product: PRODUCT_SUMMARY, buyer: USER_SUMMARY, seller: USER_SUMMARY },
    });
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    return offer;
  }

  async acceptOffer(sellerId: string, id: string) {
    const offer = await this.findOwnedOffer(id);
    if (offer.sellerId !== sellerId) {
      throw new ForbiddenException('You can only respond to offers made on your own listings');
    }
    if (offer.status !== OfferStatus.PENDING) {
      throw new BadRequestException(`This offer has already been ${offer.status.toLowerCase()}`);
    }

    const updated = await this.prisma.offer.update({
      where: { id },
      data: { status: OfferStatus.ACCEPTED, respondedAt: new Date() },
      include: { product: PRODUCT_SUMMARY, buyer: USER_SUMMARY, seller: USER_SUMMARY },
    });

    await this.userNotifications.notifyUser(offer.buyerId, {
      type: 'OFFER_ACCEPTED',
      title: 'Your offer was accepted',
      message: `Your offer of ${offer.product.currency} ${offer.amount} for "${offer.product.title}" was accepted.`,
      link: `/listing/${offer.productId}`,
      metadata: { offerId: offer.id, productId: offer.productId },
    });

    return updated;
  }

  async rejectOffer(sellerId: string, id: string) {
    const offer = await this.findOwnedOffer(id);
    if (offer.sellerId !== sellerId) {
      throw new ForbiddenException('You can only respond to offers made on your own listings');
    }
    if (offer.status !== OfferStatus.PENDING) {
      throw new BadRequestException(`This offer has already been ${offer.status.toLowerCase()}`);
    }

    const updated = await this.prisma.offer.update({
      where: { id },
      data: { status: OfferStatus.REJECTED, respondedAt: new Date() },
      include: { product: PRODUCT_SUMMARY, buyer: USER_SUMMARY, seller: USER_SUMMARY },
    });

    await this.userNotifications.notifyUser(offer.buyerId, {
      type: 'OFFER_REJECTED',
      title: 'Your offer was declined',
      message: `Your offer of ${offer.product.currency} ${offer.amount} for "${offer.product.title}" was declined.`,
      link: `/offers`,
      metadata: { offerId: offer.id, productId: offer.productId },
    });

    return updated;
  }

  async withdrawOffer(buyerId: string, id: string) {
    const offer = await this.findOwnedOffer(id);
    if (offer.buyerId !== buyerId) {
      throw new ForbiddenException('You can only withdraw your own offers');
    }
    if (offer.status !== OfferStatus.PENDING) {
      throw new BadRequestException(`This offer has already been ${offer.status.toLowerCase()}`);
    }

    return this.prisma.offer.update({
      where: { id },
      data: { status: OfferStatus.WITHDRAWN, respondedAt: new Date() },
    });
  }
}
