import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ModerationRepository } from '../repositories/moderation.repository';
import { WarnUserDto } from '../dto/warn-user.dto';
import { SuspendUserDto } from '../dto/suspend-user.dto';
import { BanUserDto } from '../dto/ban-user.dto';
import { HideListingDto } from '../dto/hide-listing.dto';
import { DeleteListingDto } from '../dto/delete-listing.dto';
import { DeleteMessageDto } from '../dto/delete-message.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UserStatus, ProductStatus, ModerationActionType } from '@prisma/client';

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

  constructor(
    private readonly moderationRepository: ModerationRepository,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {}

  async warnUser(moderatorId: string, dto: WarnUserDto) {
    this.logger.log(`Moderator ${moderatorId} warning user ${dto.userId}`);

    // Create Warning History Record
    const warning = await this.moderationRepository.createWarning({
      userId: dto.userId,
      caseId: dto.caseId || null,
      reason: dto.reason,
      warnedById: moderatorId,
    });

    // Record Action
    await this.moderationRepository.createAction({
      caseId: dto.caseId || null,
      moderatorId,
      actionType: ModerationActionType.WARN_USER,
      targetType: 'USER',
      targetId: dto.userId,
      reason: dto.reason,
    });

    // Also apply a User Strike
    await this.applyUserStrike(dto.userId, dto.reason, dto.caseId, moderatorId);

    // Notify user
    await this.notificationQueue.add('push-notification', {
      userId: dto.userId,
      title: 'Safety Warning Issued',
      body: `You have received a moderation warning: "${dto.reason}". Future violations will lead to account suspension.`,
    });

    return warning;
  }

  async suspendUser(moderatorId: string, dto: SuspendUserDto) {
    this.logger.log(`Moderator ${moderatorId} suspending user ${dto.userId} for ${dto.durationDays} days`);

    // Update user status
    const user = await this.moderationRepository.updateUserStatus(dto.userId, UserStatus.SUSPENDED);

    // Record Action
    await this.moderationRepository.createAction({
      caseId: dto.caseId || null,
      moderatorId,
      actionType: ModerationActionType.SUSPEND_USER,
      targetType: 'USER',
      targetId: dto.userId,
      reason: `Suspended for ${dto.durationDays} days: ${dto.reason}`,
    });

    // Notify user
    await this.notificationQueue.add('push-notification', {
      userId: dto.userId,
      title: 'Account Suspended',
      body: `Your account has been suspended for ${dto.durationDays} days due to: "${dto.reason}".`,
    });

    return user;
  }

  async banUser(moderatorId: string, dto: BanUserDto) {
    this.logger.log(`Moderator ${moderatorId} banning user ${dto.userId}`);

    // Update user status to deleted/banned state
    const user = await this.moderationRepository.updateUserStatus(dto.userId, UserStatus.DELETED);

    // Create blocklist record
    await this.moderationRepository.createBlockedContent({
      type: 'USER',
      targetId: dto.userId,
      reason: dto.reason,
      blockedById: moderatorId,
    });

    // Record Action
    await this.moderationRepository.createAction({
      caseId: dto.caseId || null,
      moderatorId,
      actionType: ModerationActionType.BAN_USER,
      targetType: 'USER',
      targetId: dto.userId,
      reason: dto.reason,
    });

    // Notify user (fallback, they may not be able to log in)
    await this.notificationQueue.add('push-notification', {
      userId: dto.userId,
      title: 'Account Terminated',
      body: `Your account has been permanently banned from Loopo Marketplace due to: "${dto.reason}".`,
    });

    return user;
  }

  async hideListing(moderatorId: string, dto: HideListingDto) {
    this.logger.log(`Moderator ${moderatorId} hiding listing ${dto.listingId}`);

    // Update listing status
    const product = await this.moderationRepository.updateListingStatus(dto.listingId, ProductStatus.PAUSED);

    // Record Action
    await this.moderationRepository.createAction({
      caseId: dto.caseId || null,
      moderatorId,
      actionType: ModerationActionType.HIDE_LISTING,
      targetType: 'LISTING',
      targetId: dto.listingId,
      reason: dto.reason,
    });

    // Notify listing seller
    await this.notificationQueue.add('push-notification', {
      userId: product.sellerId,
      title: 'Listing Hidden',
      body: `Your listing "${product.title}" has been hidden by moderation: "${dto.reason}".`,
    });

    return product;
  }

  async deleteListing(moderatorId: string, dto: DeleteListingDto) {
    this.logger.log(`Moderator ${moderatorId} deleting listing ${dto.listingId}`);

    // Update listing status to ARCHIVED/DELETED
    const product = await this.moderationRepository.updateListingStatus(dto.listingId, ProductStatus.ARCHIVED);

    // Create blocklist entry for content integrity checks
    await this.moderationRepository.createBlockedContent({
      type: 'LISTING',
      targetId: dto.listingId,
      reason: dto.reason,
      blockedById: moderatorId,
    });

    // Record Action
    await this.moderationRepository.createAction({
      caseId: dto.caseId || null,
      moderatorId,
      actionType: ModerationActionType.DELETE_LISTING,
      targetType: 'LISTING',
      targetId: dto.listingId,
      reason: dto.reason,
    });

    // Notify seller
    await this.notificationQueue.add('push-notification', {
      userId: product.sellerId,
      title: 'Listing Removed',
      body: `Your listing "${product.title}" has been removed due to safety violations: "${dto.reason}".`,
    });

    return product;
  }

  async deleteChatMessage(moderatorId: string, dto: DeleteMessageDto) {
    this.logger.log(`Moderator ${moderatorId} removing message ${dto.messageId}`);

    const messageText = 'This message was removed by moderator.';
    const message = await this.moderationRepository.updateChatMessageStatus(dto.messageId, messageText);

    // Record Action
    await this.moderationRepository.createAction({
      caseId: dto.caseId || null,
      moderatorId,
      actionType: ModerationActionType.DELETE_MESSAGE,
      targetType: 'CHAT_MESSAGE',
      targetId: dto.messageId,
      reason: dto.reason,
    });

    return message;
  }

  async applyUserStrike(userId: string, reason: string, caseId?: string, moderatorId?: string) {
    this.logger.log(`Applying user strike to ${userId}`);

    // Add strike
    await this.moderationRepository.createUserStrike({
      userId,
      caseId: caseId || null,
      reason,
      strikeCount: 1,
    });

    // Fetch cumulative strikes
    const strikes = await this.moderationRepository.getUserStrikesCount(userId);
    this.logger.log(`User ${userId} has accumulated ${strikes} strikes`);

    // Automatic discipline rules
    if (strikes >= 5) {
      this.logger.warn(`User ${userId} has reached 5 strikes. Executing automatic permanent ban.`);
      await this.banUser(moderatorId || userId, {
        userId,
        caseId,
        reason: `Automated ban: reached strike threshold (Current: ${strikes})`,
      });
    } else if (strikes >= 3) {
      this.logger.warn(`User ${userId} has reached 3 strikes. Executing automatic temporary suspension.`);
      await this.suspendUser(moderatorId || userId, {
        userId,
        durationDays: 7,
        caseId,
        reason: `Automated suspension: reached strike threshold (Current: ${strikes})`,
      });
    }

    return strikes;
  }

  async getModerationDashboardStats() {
    return this.moderationRepository.getModerationDashboardStats();
  }
}
