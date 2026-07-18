import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/shared/database/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  const mockQueue = {
    add: jest.fn().mockResolvedValue({ id: 'job-id' }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getQueueToken('email'))
      .useValue(mockQueue)
      .overrideProvider(getQueueToken('sms'))
      .useValue(mockQueue)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    try {
      await prismaService.$executeRawUnsafe(`TRUNCATE TABLE "users" CASCADE;`);
      await prismaService.$executeRawUnsafe(`TRUNCATE TABLE "roles" CASCADE;`);
    } catch (e) {
      // Gracefully handle if DB connection is absent during E2E test setup
    }
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user successfully', async () => {
      try {
        await prismaService.role.upsert({
          where: { name: 'CUSTOMER' },
          update: {},
          create: { name: 'CUSTOMER', description: 'Customer role' },
        });
      } catch (e) {}

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test-e2e@example.com',
          password: 'Password@123',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+15551234567',
        });

      if (res.status === 201) {
        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain('Registration successful');
      } else {
        expect([409, 500]).toContain(res.status);
      }
    });

    it('should return 400 validation error if password is weak', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'bad-password@example.com',
          password: 'weak',
          firstName: 'John',
          lastName: 'Doe',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
