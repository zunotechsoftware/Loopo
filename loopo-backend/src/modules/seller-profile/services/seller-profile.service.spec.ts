import { Test, TestingModule } from '@nestjs/testing';
import { SellerProfileService } from './seller-profile.service';
import { SellerProfileRepository } from '../repositories/seller-profile.repository';
import { PrismaService } from '../../../shared/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('SellerProfileService Unit Tests', () => {
  let service: SellerProfileService;
  let repositoryMock: any;
  let prismaMock: any;

  beforeEach(async () => {
    repositoryMock = {
      findByUserId: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    };

    prismaMock = {
      userSubscription: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SellerProfileService,
        { provide: SellerProfileRepository, useValue: repositoryMock },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<SellerProfileService>(SellerProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return seller profile if found', async () => {
      const mockProfile = { id: 'sp-id', userId: 'user-id', displayName: 'Test Store' };
      repositoryMock.findByUserId.mockResolvedValue(mockProfile);

      const result = await service.getProfile('user-id');
      expect(result).toEqual(mockProfile);
      expect(repositoryMock.findByUserId).toHaveBeenCalledWith('user-id');
    });

    it('should throw NotFoundException if profile is not found', async () => {
      repositoryMock.findByUserId.mockResolvedValue(null);

      await expect(service.getProfile('user-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update and return profile if it exists', async () => {
      const mockProfile = { id: 'sp-id', userId: 'user-id', displayName: 'Test Store' };
      repositoryMock.findByUserId.mockResolvedValue(mockProfile);
      repositoryMock.update.mockResolvedValue({ ...mockProfile, displayName: 'New Name' });

      const result = await service.updateProfile('user-id', { displayName: 'New Name' });
      expect(result.displayName).toEqual('New Name');
      expect(repositoryMock.update).toHaveBeenCalledWith('user-id', { displayName: 'New Name' });
    });
  });

  describe('getSubscription', () => {
    it('should return subscription if found in database', async () => {
      const mockSub = { userId: 'user-id', plan: { name: 'Premium' } };
      prismaMock.userSubscription.findUnique.mockResolvedValue(mockSub);

      const result = await service.getSubscription('user-id');
      expect(result).toEqual(mockSub);
    });

    it('should return Free mock subscription if none found', async () => {
      prismaMock.userSubscription.findUnique.mockResolvedValue(null);

      const result = await service.getSubscription('user-id');
      expect(result.plan.name).toEqual('Free');
    });
  });
});
