import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../src/shared/database/prisma.service';

describe('Reviews, Ratings & Reputation (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let prisma: PrismaService;
  let buyerToken: string;
  let sellerToken: string;
  let adminToken: string;
  let createdReviewId: string;

  const mockBuyer = {
    id: 'e2eebc99-aaaa-4ef8-bb6d-6bb9bd380101',
    email: 'review-buyer@loopo.com',
    roles: ['CUSTOMER'],
  };
  const mockSeller = {
    id: 'e2eebc99-bbbb-4ef8-bb6d-6bb9bd380102',
    email: 'review-seller@loopo.com',
    roles: ['CUSTOMER'],
  };
  const mockAdmin = {
    id: 'e2eebc99-cccc-4ef8-bb6d-6bb9bd380103',
    email: 'review-admin@loopo.com',
    roles: ['ADMIN'],
  };

  const PRODUCT_ID = 'e2eebc99-dddd-4ef8-bb6d-6bb9bd380200';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);

    // Seed users
    const users = [mockBuyer, mockSeller, mockAdmin];
    for (const u of users) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: { status: 'ACTIVE' },
        create: { id: u.id, email: u.email, status: 'ACTIVE', provider: 'LOCAL' },
      });
      for (const roleName of u.roles) {
        const role = await prisma.role.findUnique({ where: { name: roleName } });
        if (role) {
          await prisma.userRole.upsert({
            where: { userId_roleId: { userId: u.id, roleId: role.id } },
            update: {},
            create: { userId: u.id, roleId: role.id },
          });
        }
      }
    }

    // Clear RBAC Redis cache
    const redisClient = app.get('REDIS_CLIENT');
    await redisClient.del('role:permissions:CUSTOMER');
    await redisClient.del('role:permissions:ADMIN');

    // Sign tokens
    buyerToken = jwtService.sign({ sub: mockBuyer.id, email: mockBuyer.email, roles: ['CUSTOMER'] });
    sellerToken = jwtService.sign({ sub: mockSeller.id, email: mockSeller.email, roles: ['CUSTOMER'] });
    adminToken = jwtService.sign({ sub: mockAdmin.id, email: mockAdmin.email, roles: ['ADMIN'] });

    // Seed category + product
    const category = await prisma.category.upsert({
      where: { slug: 'test-reviews-cat' },
      update: {},
      create: { name: 'Reviews Test Category', slug: 'test-reviews-cat', isActive: true },
    });

    await prisma.product.upsert({
      where: { id: PRODUCT_ID },
      update: { status: 'APPROVED' },
      create: {
        id: PRODUCT_ID,
        sellerId: mockSeller.id,
        categoryId: category.id,
        title: 'Vintage Camera',
        slug: 'vintage-camera-review-e2e',
        description: 'A beautiful vintage film camera.',
        price: 3500,
        currency: 'INR',
        condition: 'GOOD',
        status: 'APPROVED',
      },
    });

    await app.init();
  });

  afterAll(async () => {
    // Cleanup reviews
    await prisma.reviewReaction.deleteMany({ where: { userId: mockBuyer.id } });
    await prisma.reviewRating.deleteMany({ where: { review: { reviewerId: mockBuyer.id } } });
    await prisma.review.deleteMany({ where: { reviewerId: mockBuyer.id } });
    await prisma.sellerStatistics.deleteMany({ where: { userId: mockSeller.id } });
    await prisma.reputationScore.deleteMany({ where: { userId: mockSeller.id } });
    await app.close();
  });

  describe('Review Creation', () => {
    it('POST /api/v1/reviews - should create a seller review', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          reviewType: 'SELLER_REVIEW',
          targetUserId: mockSeller.id,
          productId: PRODUCT_ID,
          title: 'Excellent seller',
          content: 'Very responsive and item was exactly as described.',
          rating: {
            overall: 5,
            communication: 5,
            responseTime: 4,
            productAccuracy: 5,
            wouldRecommend: true,
          },
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.reviewType).toBe('SELLER_REVIEW');
      expect(response.body.ratings[0].overall).toBe(5);
      createdReviewId = response.body.id;
    });

    it('POST /api/v1/reviews - should reject self-review', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          reviewType: 'SELLER_REVIEW',
          targetUserId: mockSeller.id,
          productId: PRODUCT_ID,
          content: 'I am great!',
          rating: { overall: 5 },
        })
        .expect(400);
    });

    it('POST /api/v1/reviews - should reject duplicate review for same product+type', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          reviewType: 'SELLER_REVIEW',
          targetUserId: mockSeller.id,
          productId: PRODUCT_ID,
          content: 'Trying to duplicate',
          rating: { overall: 3 },
        })
        .expect(400);
    });
  });

  describe('Review Reading', () => {
    it('GET /api/v1/reviews/:id - should fetch review by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/reviews/${createdReviewId}`)
        .expect(200);

      expect(response.body.id).toBe(createdReviewId);
      expect(response.body.content).toBe('Very responsive and item was exactly as described.');
    });

    it('GET /api/v1/users/:id/reviews - should list seller reviews', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${mockSeller.id}/reviews`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/v1/products/:id/reviews - should list product reviews', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/products/${PRODUCT_ID}/reviews`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Reactions', () => {
    it('POST /api/v1/reviews/:id/reactions - should add HELPFUL reaction', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/reviews/${createdReviewId}/reactions`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ type: 'HELPFUL' })
        .expect(201);

      expect(response.body).toHaveProperty('type', 'HELPFUL');
    });

    it('DELETE /api/v1/reviews/:id/reactions - should remove HELPFUL reaction', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/reviews/${createdReviewId}/reactions`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ type: 'HELPFUL' })
        .expect(200);
    });
  });

  describe('Ratings Aggregation', () => {
    it('GET /api/v1/users/:id/rating - should return user reputation data', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${mockSeller.id}/rating`)
        .expect(200);

      expect(response.body).toHaveProperty('sellerStats');
      expect(response.body).toHaveProperty('reputation');
    });

    it('GET /api/v1/products/:id/rating - should return product rating', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/products/${PRODUCT_ID}/rating`)
        .expect(200);

      expect(response.body).toHaveProperty('averageRating');
      expect(response.body).toHaveProperty('totalReviews');
    });
  });

  describe('Admin Moderation', () => {
    it('GET /api/v1/admin/reviews - should list all reviews for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/reviews')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('PATCH /api/v1/admin/reviews/:id/hide - should hide a review', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/admin/reviews/${createdReviewId}/hide`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.isVisible).toBe(false);
    });

    it('PATCH /api/v1/admin/reviews/:id/restore - should restore a hidden review', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/admin/reviews/${createdReviewId}/restore`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.isVisible).toBe(true);
    });
  });
});
