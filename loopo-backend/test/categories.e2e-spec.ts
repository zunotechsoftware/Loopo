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

describe('Categories & Attributes (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let adminToken: string;
  let customerToken: string;
  let createdCategoryId: string;
  let createdChildId: string;
  let createdAttrId: string;

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

    // 1. Seed Roles and Super Admin in database
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

      const categoriesCreatePerm = await prismaService.permission.upsert({
        where: { name: 'categories.create' },
        update: {},
        create: { name: 'categories.create', description: 'Create categories' },
      });

      const categoriesManagePerm = await prismaService.permission.upsert({
        where: { name: 'categories.manage' },
        update: {},
        create: { name: 'categories.manage', description: 'Manage categories' },
      });

      await prismaService.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: categoriesCreatePerm.id } },
        update: {},
        create: { roleId: superAdminRole.id, permissionId: categoriesCreatePerm.id },
      });

      await prismaService.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: categoriesManagePerm.id } },
        update: {},
        create: { roleId: superAdminRole.id, permissionId: categoriesManagePerm.id },
      });
    } catch (e) {}

    // 2. Setup Super Admin Auth
    const adminEmail = `admin-e2e-${Date.now()}@example.com`;
    const customerEmail = `customer-e2e-${Date.now()}@example.com`;

    // Register customer
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: customerEmail,
        password: 'Password@123',
        firstName: 'Customer',
        lastName: 'E2E',
        phone: `+1555${Math.floor(1000000 + Math.random() * 9000000)}`,
      });

    const custLoginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: customerEmail, password: 'Password@123' });
    customerToken = custLoginRes.body.data.accessToken;

    // Register admin (we will manually attach SUPER_ADMIN role in database)
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

    const superAdminRole = await prismaService.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
    if (superAdminRole) {
      await prismaService.userRole.create({
        data: { userId: adminUserId, roleId: superAdminRole.id },
      });
    }

    const adminLoginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: adminEmail, password: 'Password@123' });
    adminToken = adminLoginRes.body.data.accessToken;
  });

  afterAll(async () => {
    try {
      await prismaService.$executeRawUnsafe(`TRUNCATE TABLE "categories" CASCADE;`);
      await prismaService.$executeRawUnsafe(`TRUNCATE TABLE "users" CASCADE;`);
    } catch (e) {}
    await app.close();
  });

  describe('Categories Management (CRUD)', () => {
    it('POST /api/v1/categories -> should block non-admin users', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ name: 'Vehicles', description: 'All kinds of transport' });

      expect(res.status).toBe(403);
    });

    it('POST /api/v1/categories -> should create a root category for admins', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Vehicles', description: 'All kinds of transport', sortOrder: 1 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Vehicles');
      expect(res.body.data.slug).toBe('vehicles');
      createdCategoryId = res.body.data.id;
    });

    it('POST /api/v1/categories -> should create nested child category', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Cars',
          parentId: createdCategoryId,
          description: 'SUV and Sedan cars',
          sortOrder: 1,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.parentId).toBe(createdCategoryId);
      expect(res.body.data.slug).toBe('vehicles-cars');
      createdChildId = res.body.data.id;
    });

    it('GET /api/v1/categories/tree -> should return public category tree structure', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/categories/tree');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const vehicleNode = res.body.data.find((c: any) => c.id === createdCategoryId);
      expect(vehicleNode).toBeDefined();
      expect(vehicleNode.children.length).toBeGreaterThan(0);
      expect(vehicleNode.children[0].id).toBe(createdChildId);
    });

    it('PUT /api/v1/categories/:id -> should prevent cycle (making self parent)', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/v1/categories/${createdCategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ parentId: createdCategoryId });

      expect(res.status).toBe(400);
    });

    it('GET /api/v1/categories/:id/path -> should return ancestry path', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/categories/${createdChildId}/path`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].id).toBe(createdCategoryId);
      expect(res.body.data[1].id).toBe(createdChildId);
    });
  });

  describe('Attributes & Option Forms', () => {
    it('POST /api/v1/categories/:id/attributes -> should create dynamic attribute', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/categories/${createdCategoryId}/attributes`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Fuel Type',
          type: 'SELECT',
          isRequired: true,
          placeholder: 'Select Fuel',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Fuel Type');
      expect(res.body.data.slug).toBe('fuel-type');
      createdAttrId = res.body.data.id;
    });

    it('POST /api/v1/attributes/:id/options -> should create attribute value options', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/attributes/${createdAttrId}/options`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          value: 'petrol',
          label: 'Petrol',
          sortOrder: 1,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.value).toBe('petrol');
    });

    it('GET /api/v1/categories/:id/attributes -> should return inherited form schema', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/categories/${createdChildId}/attributes`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      const fuelAttr = res.body.data.find((a: any) => a.id === createdAttrId);
      expect(fuelAttr).toBeDefined();
      expect(fuelAttr.options.length).toBeGreaterThan(0);
      expect(fuelAttr.options[0].value).toBe('petrol');
    });
  });
});
