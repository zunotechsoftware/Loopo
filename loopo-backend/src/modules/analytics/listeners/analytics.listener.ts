import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ANALYTICS_QUEUE, EVENTS } from '../constants/analytics.constants';

@Injectable()
export class AnalyticsListener {
  private readonly logger = new Logger(AnalyticsListener.name);

  constructor(@InjectQueue(ANALYTICS_QUEUE) private readonly analyticsQueue: Queue) {}

  @OnEvent(EVENTS.USER_REGISTERED)
  async handleUserRegistered(payload: any) {
    await this.enqueueEvent(EVENTS.USER_REGISTERED, payload);
  }

  @OnEvent(EVENTS.USER_LOGGED_IN)
  async handleUserLoggedIn(payload: any) {
    await this.enqueueEvent(EVENTS.USER_LOGGED_IN, payload);
  }

  @OnEvent(EVENTS.PRODUCT_VIEWED)
  async handleProductViewed(payload: any) {
    await this.enqueueEvent(EVENTS.PRODUCT_VIEWED, payload);
  }

  @OnEvent(EVENTS.PRODUCT_FAVORITED)
  async handleProductFavorited(payload: any) {
    await this.enqueueEvent(EVENTS.PRODUCT_FAVORITED, payload);
  }

  @OnEvent(EVENTS.PRODUCT_SHARED)
  async handleProductShared(payload: any) {
    await this.enqueueEvent(EVENTS.PRODUCT_SHARED, payload);
  }

  @OnEvent(EVENTS.SEARCH_PERFORMED)
  async handleSearchPerformed(payload: any) {
    await this.enqueueEvent(EVENTS.SEARCH_PERFORMED, payload);
  }

  @OnEvent(EVENTS.CHAT_STARTED)
  async handleChatStarted(payload: any) {
    await this.enqueueEvent(EVENTS.CHAT_STARTED, payload);
  }

  @OnEvent(EVENTS.MESSAGE_SENT)
  async handleMessageSent(payload: any) {
    await this.enqueueEvent(EVENTS.MESSAGE_SENT, payload);
  }

  @OnEvent(EVENTS.PAYMENT_COMPLETED)
  async handlePaymentCompleted(payload: any) {
    await this.enqueueEvent(EVENTS.PAYMENT_COMPLETED, payload);
  }

  @OnEvent(EVENTS.NOTIFICATION_SENT)
  async handleNotificationSent(payload: any) {
    await this.enqueueEvent(EVENTS.NOTIFICATION_SENT, payload);
  }

  @OnEvent(EVENTS.REVIEW_CREATED)
  async handleReviewCreated(payload: any) {
    await this.enqueueEvent(EVENTS.REVIEW_CREATED, payload);
  }

  private async enqueueEvent(eventName: string, payload: any) {
    try {
      await this.analyticsQueue.add(eventName, payload, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: false,
      });
    } catch (error) {
      this.logger.error(`Failed to enqueue analytics event ${eventName}`, error);
    }
  }
}
