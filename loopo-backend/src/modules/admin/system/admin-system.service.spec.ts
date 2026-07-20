import { Test, TestingModule } from '@nestjs/testing';
import { AdminSystemService } from './admin-system.service';
import { PrismaService } from '../../../shared/database/prisma.service';
import { RedisService } from '../../../shared/redis/redis.service';
import { ConfigService } from '@nestjs/config';

describe('AdminSystemService', () => {
  let service: AdminSystemService;
  let prismaService: jest.Mocked<PrismaService>;
  let redisService: jest.Mocked<RedisService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockPrisma = {
      $queryRaw: jest.fn(),
    };
    
    const mockRedis = {
      set: jest.fn(),
      get: jest.fn(),
    };
    
    const mockConfig = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminSystemService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AdminSystemService>(AdminSystemService);
    prismaService = module.get(PrismaService);
    redisService = module.get(RedisService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHealthStatus', () => {
    it('should return connected for DB and Redis if they are healthy', async () => {
      prismaService.$queryRaw.mockResolvedValueOnce([{ '?column?': 1 }]);
      redisService.get.mockResolvedValueOnce('ok');

      const result = await service.getHealthStatus();

      expect(result.database).toBe('connected');
      expect(result.redis).toBe('connected');
      expect(result.storage).toBe('ok');
    });

    it('should return disconnected if health checks fail', async () => {
      prismaService.$queryRaw.mockRejectedValueOnce(new Error('DB Error'));
      redisService.get.mockRejectedValueOnce(new Error('Redis Error'));

      const result = await service.getHealthStatus();

      expect(result.database).toBe('disconnected');
      expect(result.redis).toBe('disconnected');
      expect(result.storage).toBe('ok');
    });
  });

  describe('getVersionInfo', () => {
    it('should return version information from config', async () => {
      configService.get.mockImplementation((key) => {
        if (key === 'APP_VERSION') return '1.2.3';
        if (key === 'NODE_ENV') return 'production';
      });

      const result = await service.getVersionInfo();
      expect(result.version).toBe('1.2.3');
      expect(result.environment).toBe('production');
    });
  });
});
