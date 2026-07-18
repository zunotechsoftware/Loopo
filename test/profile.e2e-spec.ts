import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/shared/database/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';
import { EmailProcessor } from './../src/shared/queues/processors/email.processor';
import { SmsProcessor } from './../src/shared/queues/processors/sms.processor';
import { NotificationProcessor } from './../src/shared/queues/processors/notification.processor';
import { ProfileImageProcessingProcessor } from './../src/shared/queues/processors/profile-image-processing.processor';
import { TransformInterceptor } from './../src/shared/common/interceptors/transform.interceptor';

describe('Profile & RBAC & Addresses (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authToken: string;
  let userId: string;

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
      .overrideProvider(getQueueToken('notification'))
      .useValue(mockQueue)
      .overrideProvider(getQueueToken('profile-image-processing'))
      .useValue(mockQueue)
      .overrideProvider(EmailProcessor)
      .useValue({})
      .overrideProvider(SmsProcessor)
      .useValue({})
      .overrideProvider(NotificationProcessor)
      .useValue({})
      .overrideProvider(ProfileImageProcessingProcessor)
      .useValue({})
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalInterceptors(new TransformInterceptor());

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Reseed necessary roles
    try {
      await prismaService.role.upsert({
        where: { name: 'CUSTOMER' },
        update: {},
        create: { name: 'CUSTOMER', description: 'Customer role' },
      });
    } catch (e) {}

    // Register a user for tests
    const email = `profile-e2e-${Date.now()}@example.com`;
    const regRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email,
        password: 'Password@123',
        firstName: 'ProfileTest',
        lastName: 'User',
        phone: `+1555${Math.floor(1000000 + Math.random() * 9000000)}`,
      });
    console.log('Registration Status:', regRes.status, 'Body:', JSON.stringify(regRes.body));

    // Login to get token
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email,
        password: 'Password@123',
      });
    console.log('Login Status:', loginRes.status, 'Body:', JSON.stringify(loginRes.body));

    authToken = loginRes.body.data.accessToken;
    userId = loginRes.body.data.user.id;
  });

  afterAll(async () => {
    try {
      await prismaService.$executeRawUnsafe(`TRUNCATE TABLE "users" CASCADE;`);
    } catch (e) {}
    await app.close();
  });

  describe('Users & Profiles', () => {
    it('GET /api/v1/users/me -> should return profile and default details', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile).toBeDefined();
      expect(res.body.data.profile.displayName).toContain('ProfileTest');
    });

    it('PUT /api/v1/users/me -> should update profile bio and preferredLanguage', async () => {
      const res = await request(app.getHttpServer())
        .put('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bio: 'I am a software tester.',
          preferredLanguage: 'es',
          website: 'https://tester.com',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bio).toBe('I am a software tester.');
      expect(res.body.data.preferredLanguage).toBe('es');
      expect(res.body.data.profileCompletionPercentage).toBeGreaterThan(0);
    });
  });

  describe('Addresses', () => {
    let addressId: string;

    it('POST /api/v1/addresses -> should create an address', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/addresses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'HOME',
          fullName: 'Test Recipient',
          phone: '+15559999',
          addressLine1: '999 Testing Ave',
          city: 'QA City',
          state: 'Test State',
          country: 'Testland',
          postalCode: '12345',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fullName).toBe('Test Recipient');
      expect(res.body.data.isDefault).toBe(true); // first address auto-defaulted
      addressId = res.body.data.id;
    });

    it('GET /api/v1/addresses -> should list addresses', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/addresses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('PUT /api/v1/addresses/:id -> should update address info', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/v1/addresses/${addressId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fullName: 'Test Recipient Updated',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fullName).toBe('Test Recipient Updated');
    });
  });

  describe('RBAC Guards Restrictions', () => {
    it('GET /api/v1/roles -> should reject standard customer with 403 Forbidden', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/roles')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(403);
    });

    it('POST /api/v1/roles -> should reject standard customer with 403 Forbidden', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/roles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'TEST_ROLE_GUARDS',
        });

      expect(res.status).toBe(403);
    });
  });
});
