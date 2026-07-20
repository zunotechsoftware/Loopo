import { Test, TestingModule } from '@nestjs/testing';
import { ModerationService } from './moderation.service';
import { ModerationRepository } from '../repositories/moderation.repository';
import { getQueueToken } from '@nestjs/bullmq';
import { UserStatus, ProductStatus, ModerationActionType } from '@prisma/client';

describe('ModerationService', () => {
  let service: ModerationService;
  let repository: ModerationRepository;

  const mockNotificationQueue = { add: jest.fn().mockResolvedValue({}) };

  const mockModerationRepository = {
    createWarning: jest.fn(),
    createAction: jest.fn(),
    createBlockedContent: jest.fn(),
    createUserStrike: jest.fn(),
    getUserStrikesCount: jest.fn(),
    updateUserStatus: jest.fn(),
    updateListingStatus: jest.fn(),
    updateChatMessageStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModerationService,
        { provide: ModerationRepository, useValue: mockModerationRepository },
        { provide: getQueueToken('notification'), useValue: mockNotificationQueue },
      ],
    }).compile();

    service = module.get<ModerationService>(ModerationService);
    repository = module.get<ModerationRepository>(ModerationRepository);

    jest.clearAllMocks();
  });

  describe('warnUser', () => {
    it('should create warning history, moderation action, apply strike, and notify user', async () => {
      mockModerationRepository.createWarning.mockResolvedValue({ id: 'warning-id' });
      mockModerationRepository.getUserStrikesCount.mockResolvedValue(1);

      const result = await service.warnUser('mod-id', {
        userId: 'user-id',
        reason: 'Inappropriate listing content',
      });

      expect(repository.createWarning).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-id',
          warnedById: 'mod-id',
        }),
      );
      expect(repository.createAction).toHaveBeenCalledWith(
        expect.objectContaining({
          actionType: ModerationActionType.WARN_USER,
          targetId: 'user-id',
        }),
      );
      expect(repository.createUserStrike).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-id',
          strikeCount: 1,
        }),
      );
      expect(mockNotificationQueue.add).toHaveBeenCalledWith('push-notification', {
        userId: 'user-id',
        title: 'Safety Warning Issued',
        body: 'You have received a moderation warning: "Inappropriate listing content". Future violations will lead to account suspension.',
      });
      expect(result).toEqual({ id: 'warning-id' });
    });
  });

  describe('suspendUser', () => {
    it('should update user status to SUSPENDED, record action, and notify user', async () => {
      mockModerationRepository.updateUserStatus.mockResolvedValue({ id: 'user-id', status: UserStatus.SUSPENDED });

      const result = await service.suspendUser('mod-id', {
        userId: 'user-id',
        durationDays: 7,
        reason: 'Abusive comments in chat',
      });

      expect(repository.updateUserStatus).toHaveBeenCalledWith('user-id', UserStatus.SUSPENDED);
      expect(repository.createAction).toHaveBeenCalledWith(
        expect.objectContaining({
          actionType: ModerationActionType.SUSPEND_USER,
          targetId: 'user-id',
        }),
      );
      expect(mockNotificationQueue.add).toHaveBeenCalledWith('push-notification', {
        userId: 'user-id',
        title: 'Account Suspended',
        body: 'Your account has been suspended for 7 days due to: "Abusive comments in chat".',
      });
      expect(result.status).toEqual(UserStatus.SUSPENDED);
    });
  });

  describe('applyUserStrike & Strike Thresholds', () => {
    it('should trigger temporary suspension automatically when user reaches 3 strikes', async () => {
      mockModerationRepository.getUserStrikesCount.mockResolvedValue(3);
      mockModerationRepository.updateUserStatus.mockResolvedValue({ id: 'user-id', status: UserStatus.SUSPENDED });

      await service.applyUserStrike('user-id', 'Abuse warning #3', undefined, 'mod-id');

      // Should automatically invoke suspendUser
      expect(repository.updateUserStatus).toHaveBeenCalledWith('user-id', UserStatus.SUSPENDED);
      expect(repository.createAction).toHaveBeenCalledWith(
        expect.objectContaining({
          actionType: ModerationActionType.SUSPEND_USER,
          reason: 'Suspended for 7 days: Automated suspension: reached strike threshold (Current: 3)',
        }),
      );
    });

    it('should trigger permanent ban automatically when user reaches 5 strikes', async () => {
      mockModerationRepository.getUserStrikesCount.mockResolvedValue(5);
      mockModerationRepository.updateUserStatus.mockResolvedValue({ id: 'user-id', status: UserStatus.DELETED });

      await service.applyUserStrike('user-id', 'Scam behavior #5', undefined, 'mod-id');

      // Should automatically invoke banUser
      expect(repository.updateUserStatus).toHaveBeenCalledWith('user-id', UserStatus.DELETED);
      expect(repository.createBlockedContent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'USER',
          targetId: 'user-id',
        }),
      );
    });
  });
});
