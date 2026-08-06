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
import { AllExceptionsFilter } from './../src/shared/common/exceptions/all-exceptions.filter';
import { RedisService } from './../src/shared/redis/redis.service';

describe('Products & Listings (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let sellerToken: string;
  let adminToken: string;
  let categoryId: string;
  let createdProductId: string;

  const mockQueue = {
    add: jest.fn().mockResolvedValue({ id: 'job-id' }),
  };

  const mockRedisService = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
    exists: jest.fn().mockResolvedValue(false),
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
      .overrideProvider(getQueueToken('image-compression'))
      .useValue(mockQueue)
      .overrideProvider(getQueueToken('thumbnail-generation'))
      .useValue(mockQueue)
      .overrideProvider(getQueueToken('product-expiration'))
      .useValue(mockQueue)
      .overrideProvider(getQueueToken('search-index-update'))
      .useValue(mockQueue)
      .overrideProvider(getQueueToken('view-counter-sync'))
      .useValue(mockQueue)
      .overrideProvider(EmailProcessor)
      .useValue({})
      .overrideProvider(SmsProcessor)
      .useValue({})
      .overrideProvider(NotificationProcessor)
      .useValue({})
      .overrideProvider(ProfileImageProcessingProcessor)
      .useValue({})
      .overrideProvider(RedisService)
      .useValue(mockRedisService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Seed permissions
    try {
      const superAdminRole = await prismaService.role.upsert({
        where: { name: 'SUPER_ADMIN' },
        update: {},
        create: { name: 'SUPER_ADMIN', description: 'Super Admin' },
      });

      const customerRole = await prismaService.role.upsert({
        where: { name: 'CUSTOMER' },
        update: {},
        create: { name: 'CUSTOMER', description: 'Customer' },
      });

      const productCreatePerm = await prismaService.permission.upsert({
        where: { name: 'products.create' },
        update: {},
        create: { name: 'products.create', description: 'Create listings' },
      });

      const productViewPerm = await prismaService.permission.upsert({
        where: { name: 'products.view' },
        update: {},
        create: { name: 'products.view', description: 'View listings' },
      });

      const productApprovePerm = await prismaService.permission.upsert({
        where: { name: 'products.approve' },
        update: {},
        create: { name: 'products.approve', description: 'Approve listings' },
      });

      const productRejectPerm = await prismaService.permission.upsert({
        where: { name: 'products.reject' },
        update: {},
        create: { name: 'products.reject', description: 'Reject listings' },
      });

      await prismaService.rolePermission.createMany({
        data: [
          { roleId: superAdminRole.id, permissionId: productCreatePerm.id },
          { roleId: superAdminRole.id, permissionId: productViewPerm.id },
          { roleId: superAdminRole.id, permissionId: productApprovePerm.id },
          { roleId: superAdminRole.id, permissionId: productRejectPerm.id },
          { roleId: customerRole.id, permissionId: productCreatePerm.id },
          { roleId: customerRole.id, permissionId: productViewPerm.id },
        ],
        skipDuplicates: true,
      });

      // Create a test category
      const cat = await prismaService.category.upsert({
        where: { slug: 'electronics' },
        update: {},
        create: { name: 'Electronics', slug: 'electronics', isActive: true },
      });
      categoryId = cat.id;
    } catch (e) {}

    // Register User & Admin
    const sellerEmail = `seller-e2e-${Date.now()}@example.com`;
    const adminEmail = `admin-e2e-${Date.now()}@example.com`;

    // Seller registration
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: sellerEmail,
        password: 'Password@123',
        firstName: 'Seller',
        lastName: 'E2E',
        phone: `+1555${Math.floor(1000000 + Math.random() * 9000000)}`,
      });

    const sellerLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: sellerEmail, password: 'Password@123' });
    sellerToken = sellerLogin.body.data.accessToken;

    // Admin registration & role mapping
    const adminReg = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: adminEmail,
        password: 'Password@123',
        firstName: 'Admin',
        lastName: 'E2E',
        phone: `+1555${Math.floor(1000000 + Math.random() * 9000000)}`,
      });
    const adminUserId = adminReg.body.data.user.id;

    const saRole = await prismaService.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
    if (saRole) {
      await prismaService.userRole.create({
        data: { userId: adminUserId, roleId: saRole.id },
      });
    }

    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: adminEmail, password: 'Password@123' });
    adminToken = adminLogin.body.data.accessToken;
  });

  afterAll(async () => {
    try {
      await prismaService.$executeRawUnsafe(`TRUNCATE TABLE "products" CASCADE;`);
      await prismaService.$executeRawUnsafe(`TRUNCATE TABLE "categories" CASCADE;`);
      await prismaService.$executeRawUnsafe(`TRUNCATE TABLE "users" CASCADE;`);
    } catch (e) {}
    await app.init();
    await app.close();
  });

  describe('Listings CRUD workflow', () => {
    it('POST /api/v1/products -> should allow registered sellers to create a listing', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          title: 'iPhone 15 Pro Max',
          description: 'Brand new, 256GB, Titanium Black colour. Sealed pack.',
          categoryId,
          condition: 'NEW',
          price: 139900,
          currency: 'INR',
          negotiable: true,
          location: {
            country: 'India',
            state: 'Maharashtra',
            city: 'Mumbai',
            area: 'Bandra',
            zipCode: '400050',
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('iPhone 15 Pro Max');
      expect(res.body.data.status).toBe('PENDING'); // Sent for moderation approval
      createdProductId = res.body.data.id;
    });

    it('GET /api/v1/products/:id -> should retrieve listing details', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/products/${createdProductId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdProductId);
      expect(res.body.data.price).toBe(139900);
    });

    it('GET /api/v1/products -> should not return pending listings publicly', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/products');

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBe(0); // Listing not approved yet
    });
  });

  describe('Admin Moderation Workflow', () => {
    it('GET /api/v1/admin/products/pending -> should retrieve listing in pending reviews', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/products/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBeGreaterThan(0);
      expect(res.body.data.items[0].id).toBe(createdProductId);
    });

    it('PATCH /api/v1/admin/products/:id/approve -> should approve listing', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/admin/products/${createdProductId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('APPROVED');
    });

    it('GET /api/v1/products -> should now include approved listing in public queries', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/products');

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBeGreaterThan(0);
      expect(res.body.data.items[0].id).toBe(createdProductId);
    });
  });
});
