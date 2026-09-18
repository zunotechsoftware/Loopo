import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { UserNotificationsService } from '../../../modules/user-notifications/services/user-notifications.service';

/** Backs every `notificationQueue.add('send', {...})` call across the app
 * (products.service.ts's listing submit/approve/reject events, and any
 * future producer). Used to only log a line and drop the job on the floor -
 * nothing was ever actually persisted or delivered to anyone. */
@Processor('notification')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly userNotifications: UserNotificationsService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const data = job.data || {};

    switch (data.type) {
      case 'LISTING_SUBMITTED':
        await this.userNotifications.notifyAdmins({
          type: 'LISTING_SUBMITTED',
          title: 'New listing awaiting review',
          message: `"${data.title || 'A new listing'}" was submitted and needs approval.`,
          // loopo-admin (the real staff tool ADMIN/SUPER_ADMIN accounts use)
          // has no per-listing deep link - review happens via a dialog off
          // its pending-queue list, so this points there rather than at
          // loopo-client's secondary `/admin/listings/:id` panel, which
          // wouldn't resolve inside loopo-admin's own router at all.
          link: `/listings/pending`,
          metadata: { listingId: data.listingId, sellerId: data.sellerId },
        });
        break;

      case 'LISTING_APPROVED':
        await this.userNotifications.notifyUser(data.userId, {
          type: 'LISTING_APPROVED',
          title: 'Your listing was approved',
          message: `"${data.title || 'Your listing'}" is now live.`,
          link: `/listing/${data.listingId}`,
          metadata: { listingId: data.listingId },
        });
        break;

      case 'LISTING_REJECTED':
        await this.userNotifications.notifyUser(data.userId, {
          type: 'LISTING_REJECTED',
          title: 'Your listing was rejected',
          message: data.metadata?.reason
            ? `"${data.title || 'Your listing'}" was rejected: ${data.metadata.reason}`
            : `"${data.title || 'Your listing'}" was rejected.`,
          link: `/my-listings`,
          metadata: { listingId: data.listingId, reason: data.metadata?.reason },
        });
        break;

      case 'push-notification': {
        const { userId, title, body } = data;
        this.logger.log(`[PUSH NOTIFICATION] Sent to User ID ${userId}: Title: "${title}", Body: "${body}"`);
        break;
      }

      default:
        this.logger.warn(`Unhandled notification job type "${data.type}" (job ${job.id})`);
    }

    return { success: true };
  }
}
