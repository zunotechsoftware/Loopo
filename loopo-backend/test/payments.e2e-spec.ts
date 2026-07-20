import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../src/shared/database/prisma.service';

describe('Payments & Subscriptions System (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let prisma: PrismaService;
  let customerToken: string;
  let adminToken: string;

  const mockCustomer = {
    id: 'f8b07384-d113-4956-a5cc-810237e19001',
    email: 'customer@loopo.com',
    roles: ['CUSTOMER'],
  };

  const mockAdmin = {
    id: 'f8b07384-d113-4956-a5cc-810237e19002',
    email: 'admin@loopo.com',
    roles: ['ADMIN'],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);

    // Clean up E2E test data from previous runs to prevent unique constraint failures
    await prisma.couponRedemption.deleteMany({
      where: { userId: { in: [mockCustomer.id, mockAdmin.id] } },
    });
    await prisma.paymentTransaction.deleteMany({
      where: { payment: { userId: { in: [mockCustomer.id, mockAdmin.id] } } },
    });
    await prisma.refund.deleteMany({
      where: { payment: { userId: { in: [mockCustomer.id, mockAdmin.id] } } },
    });
    await prisma.payment.deleteMany({
      where: { userId: { in: [mockCustomer.id, mockAdmin.id] } },
    });
    await prisma.coupon.deleteMany({
      where: { code: { in: ['ADMIN50'] } },
    });

    // Ensure mock customer is seeded
    await prisma.user.upsert({
      where: { email: mockCustomer.email },
      update: { status: 'ACTIVE' },
      create: {
        id: mockCustomer.id,
        email: mockCustomer.email,
        status: 'ACTIVE',
        provider: 'LOCAL',
      },
    });

    // Ensure mock admin is seeded
    await prisma.user.upsert({
      where: { email: mockAdmin.email },
      update: { status: 'ACTIVE' },
      create: {
        id: mockAdmin.id,
        email: mockAdmin.email,
        status: 'ACTIVE',
        provider: 'LOCAL',
      },
    });

    // Grant roles to users
    const customerRole = await prisma.role.findUnique({ where: { name: 'CUSTOMER' } });
    if (customerRole) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: mockCustomer.id, roleId: customerRole.id } },
        update: {},
        create: { userId: mockCustomer.id, roleId: customerRole.id },
      });
    }

    const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
    if (adminRole) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: mockAdmin.id, roleId: adminRole.id } },
        update: {},
        create: { userId: mockAdmin.id, roleId: adminRole.id },
      });
    }

    // Clear role permissions cache in Redis for clean verification
    const redisClient = app.get('REDIS_CLIENT');
    await redisClient.del('role:permissions:CUSTOMER');
    await redisClient.del('role:permissions:ADMIN');

    // Sign tokens
    customerToken = jwtService.sign({ sub: mockCustomer.id, email: mockCustomer.email, roles: ['CUSTOMER'] });
    adminToken = jwtService.sign({ sub: mockAdmin.id, email: mockAdmin.email, roles: ['ADMIN'] });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Subscriptions plans', () => {
    it('GET /api/v1/subscriptions/plans - should fetch list of plans', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/subscriptions/plans')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('name');
    });
  });

  describe('Featured Listing Packages', () => {
    it('GET /api/v1/featured/packages - should fetch featured packages', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/featured/packages')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('durationDays');
    });
  });

  describe('Coupons checkout', () => {
    it('POST /api/v1/coupons/apply - should calculate coupon discounts', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/coupons/apply')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          code: 'WELCOME10',
          amount: 500,
        })
        .expect(201);

      expect(response.body).toHaveProperty('discountAmount', 50);
      expect(response.body).toHaveProperty('finalAmount', 450);
    });
  });

  describe('Payments execution', () => {
    let paymentId: string;
    let providerOrderId: string;

    it('POST /api/v1/payments/create - should create Stripe payment intent', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/payments/create')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          amount: 999.00,
          currency: 'INR',
          provider: 'STRIPE',
        })
        .expect(201);

      expect(response.body).toHaveProperty('paymentId');
      expect(response.body).toHaveProperty('clientSecret');
      paymentId = response.body.paymentId;
    });

    it('POST /api/v1/payments/verify - should verify success status', async () => {
      // Mock verify response bypass or validation
      process.env.BYPASS_WEBHOOK_SIGNATURE_FOR_TESTING = 'true';
      
      const response = await request(app.getHttpServer())
        .post('/api/v1/payments/verify')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          paymentId,
          providerPaymentId: 'pi_mock_verify_123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('status', 'SUCCESS');
    });
  });

  describe('Admin Operations', () => {
    let couponId: string;

    it('POST /api/v1/admin/coupons - should create admin coupon', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'ADMIN50',
          name: 'Admin Half Off',
          type: 'PERCENTAGE',
          value: 50,
          minPurchase: 10,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('code', 'ADMIN50');
      couponId = response.body.id;
    });

    it('GET /api/v1/admin/coupons - should list coupons for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('DELETE /api/v1/admin/coupons/:id - should soft delete coupon', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/admin/coupons/${couponId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });
});
