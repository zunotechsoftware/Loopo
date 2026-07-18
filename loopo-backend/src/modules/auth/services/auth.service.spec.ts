import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/services/users.service';
import { AuthRepository } from '../repositories/auth.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let emailQueue: jest.Mocked<Queue>;

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      findByPhone: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const mockAuthRepository = {
      saveRefreshToken: jest.fn(),
      createSession: jest.fn(),
      saveEmailVerificationToken: jest.fn(),
      findEmailVerificationToken: jest.fn(),
      markEmailVerificationTokenVerified: jest.fn(),
      prisma: {
        refreshToken: {
          findMany: jest.fn(),
        },
      },
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        if (key === 'JWT_ACCESS_SECRET') return 'test-access-secret';
        if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
        return defaultValue;
      }),
    };

    const mockQueue = {
      add: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: AuthRepository, useValue: mockAuthRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getQueueToken('email'), useValue: mockQueue },
        { provide: getQueueToken('sms'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    emailQueue = module.get(getQueueToken('email'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password when valid credentials', async () => {
      const mockUser = {
        id: 'user-uuid',
        email: 'test@example.com',
        password: 'hashed-password',
        roles: ['CUSTOMER'],
      };
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'correct-password');
      expect(result).toEqual({
        id: 'user-uuid',
        email: 'test@example.com',
        roles: ['CUSTOMER'],
      });
    });

    it('should return null when credentials are invalid', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      const result = await service.validateUser('test@example.com', 'wrong-password');
      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    it('should successfully register a new user and queue verification email', async () => {
      const dto = {
        email: 'new@example.com',
        password: 'Password@123',
        firstName: 'New',
        lastName: 'User',
      };

      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue({
        id: 'new-uuid',
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        roles: ['CUSTOMER'],
      } as any);

      const result = await service.register(dto);
      expect(result.success).toBe(true);
      expect(usersService.create).toHaveBeenCalled();
      expect(emailQueue.add).toHaveBeenCalledWith('send-verification', expect.any(Object));
    });
  });
});
