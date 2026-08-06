import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../src/shared/database/prisma.service';

describe('Reports & Moderation System (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let prisma: PrismaService;
  let customerToken: string;
  let moderatorToken: string;
  let adminToken: string;

  const mockCustomer = {
    id: 'f8b07384-d113-4956-a5cc-810237e19201',
    email: 'reporter@loopo.com',
    roles: ['CUSTOMER'],
  };

  const mockViolator = {
    id: 'f8b07384-d113-4956-a5cc-810237e19202',
    email: 'violator@loopo.com',
    roles: ['CUSTOMER'],
  };

  const mockModerator = {
    id: 'f8b07384-d113-4956-a5cc-810237e19203',
    email: 'moderator@loopo.com',
    roles: ['MODERATOR'],
  };

  const mockAdmin = {
    id: 'f8b07384-d113-4956-a5cc-810237e19204',
    email: 'admin-mod@loopo.com',
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

    // Seed mock users
    const users = [mockCustomer, mockViolator, mockModerator, mockAdmin];
    for (const u of users) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: { status: 'ACTIVE' },
        create: {
          id: u.id,
          email: u.email,
          status: 'ACTIVE',
          provider: 'LOCAL',
        },
      });

      // Grant roles
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

    // Clear role permissions cache in Redis for clean test execution
    const redisClient = app.get('REDIS_CLIENT');
    await redisClient.del('role:permissions:CUSTOMER');
    await redisClient.del('role:permissions:MODERATOR');
    await redisClient.del('role:permissions:ADMIN');

    // Sign tokens
    customerToken = jwtService.sign({ sub: mockCustomer.id, email: mockCustomer.email, roles: ['CUSTOMER'] });
    moderatorToken = jwtService.sign({ sub: mockModerator.id, email: mockModerator.email, roles: ['MODERATOR'] });
    adminToken = jwtService.sign({ sub: mockAdmin.id, email: mockAdmin.email, roles: ['ADMIN'] });

    // Seed a dummy category & product listing to report
    const category = await prisma.category.upsert({
      where: { slug: 'test-moderation-cat' },
      update: {},
      create: {
        name: 'Test Mod Category',
        slug: 'test-moderation-cat',
        isActive: true,
      },
    });

    await prisma.product.upsert({
      where: { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380200' },
      update: { status: 'APPROVED' },
      create: {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380200',
        sellerId: mockViolator.id,
        categoryId: category.id,
        title: 'Violating Counterfeit Bag',
        slug: 'violating-counterfeit-bag-e2e-test',
        description: 'Replica Gucci bag for sale.',
        price: 5000,
        currency: 'INR',
        condition: 'NEW',
        status: 'APPROVED',
      },
    });

    await app.init();
  });

  afterAll(async () => {
    // Cleanup seeded structures
    await prisma.reportEvidence.deleteMany({
      where: { report: { reporterId: mockCustomer.id } },
    });
    await prisma.report.deleteMany({
      where: { reporterId: mockCustomer.id },
    });
    await prisma.caseAssignment.deleteMany({
      where: { moderatorId: mockModerator.id },
    });
    await prisma.moderationNote.deleteMany({
      where: { moderatorId: { in: [mockModerator.id, mockAdmin.id] } },
    });
    await prisma.moderationAction.deleteMany({
      where: { moderatorId: { in: [mockModerator.id, mockAdmin.id] } },
    });
    await prisma.moderationCase.deleteMany({
      where: { title: { startsWith: 'Investigation case' } },
    });
    await prisma.userStrike.deleteMany({
      where: { userId: mockViolator.id },
    });
    await prisma.warningHistory.deleteMany({
      where: { userId: mockViolator.id },
    });
    await prisma.blockedContent.deleteMany({
      where: { targetId: { in: [mockViolator.id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380200'] } },
    });
    await prisma.product.deleteMany({
      where: { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380200' },
    });

    await app.close();
  });

  describe('Report Creation Workflow', () => {
    let reportId: string;

    it('POST /api/v1/reports - should file report against product listing', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          targetType: 'LISTING',
          targetId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380200',
          reasonCode: 'COUNTERFEIT',
          details: 'Selling replicas which violate IP laws.',
          evidence: [
            { type: 'IMAGE', fileUrl: 'https://s3.loopo.com/evidence-fake-bag.jpg', textNotes: 'Close-up of replica logo.' }
          ]
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('status', 'OPEN');
      reportId = response.body.id;
    });

    it('POST /api/v1/reports - should prevent reporting the same target multiple times by the same reporter', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          targetType: 'LISTING',
          targetId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380200',
          reasonCode: 'COUNTERFEIT',
          details: 'Selling replicas which violate IP laws.',
        })
        .expect(400); // Bad Request due to spam preventions
    });

    it('GET /api/v1/reports/me - should return report history for filer', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/reports/me')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('id', reportId);
    });

    it('GET /api/v1/reports/:id - should fetch report details by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/reports/${reportId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', reportId);
      expect(response.body).toHaveProperty('targetType', 'LISTING');
    });
  });

  describe('Moderator Assignment and Escalation', () => {
    let reportId: string;

    beforeAll(async () => {
      // Create a fresh report to work with
      const report = await prisma.report.create({
        data: {
          reporterId: mockCustomer.id,
          targetType: 'USER',
          targetId: mockViolator.id,
          reasonCode: 'HARASSMENT',
          details: 'Sent threatening user comments.',
        },
      });
      reportId = report.id;
    });

    it('GET /api/v1/admin/reports - should allow moderator to filter open reports', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/reports')
        .query({ status: 'OPEN' })
        .set('Authorization', `Bearer ${moderatorToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('PATCH /api/v1/admin/reports/:id/assign - should assign case to moderator', async () => {
      // Setup the case link since mock creation in beforeAll didn't set caseId
      const targetCase = await prisma.moderationCase.create({
        data: { title: 'User Harassment Case', status: 'OPEN' }
      });

      await prisma.report.update({
        where: { id: reportId },
        data: { caseId: targetCase.id }
      });

      await request(app.getHttpServer())
        .patch(`/api/v1/admin/reports/${reportId}/assign`)
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({ moderatorId: mockModerator.id })
        .expect(200);
    });

    it('PATCH /api/v1/admin/reports/:id/escalate - should escalate report priority to Critical', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/admin/reports/${reportId}/escalate`)
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({ note: 'Highly threatening speech, user account needs ban action.' })
        .expect(200);
    });
  });

  describe('Moderator Discipline Actions', () => {
    it('POST /api/v1/admin/moderation/warn-user - should issue warning and log strike', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/moderation/warn-user')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({
          userId: mockViolator.id,
          reason: 'Warned for offensive title in replica sale.',
        })
        .expect(201);

      const strikes = await prisma.userStrike.count({ where: { userId: mockViolator.id } });
      expect(strikes).toBe(1);
    });

    it('POST /api/v1/admin/moderation/hide-listing - should set listing status to PAUSED', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/moderation/hide-listing')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({
          listingId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380200',
          reason: 'Violates counterfeit product guidelines.',
        })
        .expect(201);

      const updated = await prisma.product.findUnique({ where: { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380200' } });
      expect(updated).toHaveProperty('status', 'PAUSED');
    });

    it('POST /api/v1/admin/moderation/suspend-user - should suspend user account status', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/moderation/suspend-user')
        .set('Authorization', `Bearer ${adminToken}`) // requires users.suspend (admin role)
        .send({
          userId: mockViolator.id,
          durationDays: 7,
          reason: 'Abuse warning threshold exceeded.',
        })
        .expect(201);

      const violator = await prisma.user.findUnique({ where: { id: mockViolator.id } });
      expect(violator).toHaveProperty('status', 'SUSPENDED');
    });
  });
});
