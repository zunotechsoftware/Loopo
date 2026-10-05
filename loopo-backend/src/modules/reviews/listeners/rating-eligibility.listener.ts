import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserNotificationsService } from '../../user-notifications/services/user-notifications.service';

interface ProductSoldEvent {
  productId: string;
  productTitle: string;
  sellerId: string;
  buyerId: string;
  orderId: string;
  eligibilityId: string;
  expiresAt: Date;
}

// Purely a non-critical notification side-effect - the sale, order, and
// RatingEligibility row are already durably committed inside
// ProductsService.markSoldWithBuyer's transaction before this event fires.
@Injectable()
export class RatingEligibilityListener {
  private readonly logger = new Logger(RatingEligibilityListener.name);

  constructor(private readonly userNotifications: UserNotificationsService) {}

  @OnEvent('product.sold')
  async handleProductSold(event: ProductSoldEvent) {
    try {
      await this.userNotifications.notifyUser(event.buyerId, {
        type: 'RATING_ELIGIBLE',
        title: 'Rate your recent purchase',
        message: `You can now rate the seller for "${event.productTitle}".`,
        link: `/ratings/pending/${event.eligibilityId}`,
        metadata: { eligibilityId: event.eligibilityId, productId: event.productId, sellerId: event.sellerId },
      });
    } catch (error) {
      this.logger.error(`Failed to send rating-eligibility notification for order ${event.orderId}`, error as Error);
    }
  }
}
