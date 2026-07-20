import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/shared/database/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';
import { RedisService } from './../src/shared/redis/redis.service';
import { TransformInterceptor } from './../src/shared/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './../src/shared/common/exceptions/all-exceptions.filter';

describe('Search & Interactions Integration (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let sellerToken: string;
  let categoryId: string;
  let testProductId: string;
  let wishlistId: string;

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
      .overrideProvider(getQueueToken('search-analytics'))
      .useValue(mockQueue)
      .overrideProvider(getQueueToken('trending-calculation'))
      .useValue(mockQueue)
      .overrideProvider(getQueueToken('recommendation-refresh'))
      .useValue(mockQueue)
      .overrideProvider(getQueueToken('cache-refresh'))
      .useValue(mockQueue)
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

    // Seed database category
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

      const searchViewPerm = await prismaService.permission.upsert({
        where: { name: 'search.view' },
        update: {},
        create: { name: 'search.view', description: 'Search listings' },
      });

      const favoritesManagePerm = await prismaService.permission.upsert({
        where: { name: 'favorites.manage' },
        update: {},
        create: { name: 'favorites.manage', description: 'Manage favorites' },
      });

      const wishlistManagePerm = await prismaService.permission.upsert({
        where: { name: 'wishlist.manage' },
        update: {},
        create: { name: 'wishlist.manage', description: 'Manage wishlists' },
      });

      await prismaService.rolePermission.createMany({
        data: [
          { roleId: superAdminRole.id, permissionId: productCreatePerm.id },
          { roleId: superAdminRole.id, permissionId: productViewPerm.id },
          { roleId: superAdminRole.id, permissionId: searchViewPerm.id },
          { roleId: superAdminRole.id, permissionId: favoritesManagePerm.id },
          { roleId: superAdminRole.id, permissionId: wishlistManagePerm.id },
          { roleId: customerRole.id, permissionId: productCreatePerm.id },
          { roleId: customerRole.id, permissionId: productViewPerm.id },
          { roleId: customerRole.id, permissionId: searchViewPerm.id },
          { roleId: customerRole.id, permissionId: favoritesManagePerm.id },
          { roleId: customerRole.id, permissionId: wishlistManagePerm.id },
        ],
        skipDuplicates: true,
      });

      const cat = await prismaService.category.upsert({
        where: { slug: 'automobiles' },
        update: {},
        create: { name: 'Automobiles', slug: 'automobiles', isActive: true },
      });
      categoryId = cat.id;
    } catch (e) {}

    // Register User
    const sellerEmail = `tester-e2e-${Date.now()}@example.com`;

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: sellerEmail,
        password: 'Password@123',
        firstName: 'Tester',
        lastName: 'E2E',
        phone: `+1555${Math.floor(1000000 + Math.random() * 9000000)}`,
      });

    const sellerLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: sellerEmail, password: 'Password@123' });
    sellerToken = sellerLogin.body.data.accessToken;

    // Create a product and set to APPROVED directly for search tests
    const sellerId = sellerLogin.body.data.user.id;
    const product = await prismaService.product.create({
      data: {
        sellerId,
        categoryId,
        title: 'Toyota Fortuner SUV',
        slug: `toyota-fortuner-${Date.now()}`,
        description: '2021 model diesel engine automatic SUV.',
        condition: 'LIKE_NEW',
        price: 3500000,
        status: 'APPROVED',
        createdBy: sellerId,
        location: {
          create: {
            country: 'India',
            state: 'Maharashtra',
            city: 'Pune',
            latitude: 18.5204,
            longitude: 73.8567,
          },
        },
      },
    });
    testProductId = product.id;
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

  describe('GET /api/v1/search', () => {
    it('should successfully search for listings matching keywords', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/search')
        .query({ query: 'Toyota SUV' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
      expect(res.body.data.items[0].id).toBe(testProductId);
    });

    it('should filter listings out if outside geo radius range limit', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/search')
        .query({
          query: 'Toyota',
          latitude: 12.9716, // Bangalore coords (very far from Pune)
          longitude: 77.5946,
          radiusKm: 20,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBe(0); // Should be filtered out
    });
  });

  describe('Interactions Workflow', () => {
    it('POST /api/v1/favorites/:productId -> should add listing to favorites list', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/favorites/${testProductId}`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/v1/favorites -> should return list of favorites', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/favorites')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].productId).toBe(testProductId);
    });

    it('POST /api/v1/wishlists -> should create a new wishlist', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/wishlists')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ name: 'SUV Goals', isDefault: true });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('SUV Goals');
      wishlistId = res.body.data.id;
    });

    it('POST /api/v1/wishlists/:id/items/:productId -> should add item to custom wishlist', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/wishlists/${wishlistId}/items/${testProductId}`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });
});
