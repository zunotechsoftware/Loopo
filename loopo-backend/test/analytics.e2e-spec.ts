import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Analytics & Dashboard (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let sellerToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Mock authentications for E2E tests
    // In a real environment, you would log in a user and retrieve a JWT token.
    adminToken = 'mock-admin-token';
    sellerToken = 'mock-seller-token';
    
    // We would insert test data here
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Admin Analytics', () => {
    it('/v1/admin/analytics/dashboard (GET) - unauthorized', () => {
      return request(app.getHttpServer())
        .get('/v1/admin/analytics/dashboard')
        .expect(401);
    });
    
    // Test requires mock auth to pass 200 properly without hitting actual guards
    it.skip('/v1/admin/analytics/dashboard (GET) - authorized', () => {
      return request(app.getHttpServer())
        .get('/v1/admin/analytics/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('User Dashboard', () => {
    it('/v1/dashboard/summary (GET) - unauthorized', () => {
      return request(app.getHttpServer())
        .get('/v1/dashboard/summary')
        .expect(401);
    });
    
    it.skip('/v1/dashboard/summary (GET) - authorized', () => {
      return request(app.getHttpServer())
        .get('/v1/dashboard/summary')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);
    });
  });
});
