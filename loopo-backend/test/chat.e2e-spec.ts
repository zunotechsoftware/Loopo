import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { io, Socket } from 'socket.io-client';
import { MessageType } from '../src/modules/chat/enums/message-type.enum';
import { PrismaService } from '../src/shared/database/prisma.service';

describe('Chat System (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let token1: string;
  let token2: string;
  let socket1: Socket;
  let socket2: Socket;
  let port: number;

  const mockUser1 = { id: 'd3b07384-d113-4956-a5cc-810237e19003', email: 'buyer@loopo.com', roles: ['CUSTOMER'] };
  const mockUser2 = { id: 'd3b07384-d113-4956-a5cc-810237e19004', email: 'seller@loopo.com', roles: ['CUSTOMER'] };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    // Seed mock users to satisfy DB foreign key presence constraints
    const prisma = app.get(PrismaService);
    await prisma.user.upsert({
      where: { email: mockUser1.email },
      update: { status: 'ACTIVE' },
      create: {
        id: mockUser1.id,
        email: mockUser1.email,
        status: 'ACTIVE',
        provider: 'LOCAL',
      },
    });

    await prisma.user.upsert({
      where: { email: mockUser2.email },
      update: { status: 'ACTIVE' },
      create: {
        id: mockUser2.id,
        email: mockUser2.email,
        status: 'ACTIVE',
        provider: 'LOCAL',
      },
    });

    // Clear any previous Redis presence counters to ensure clean transitions
    const redisClient = app.get('REDIS_CLIENT');
    await redisClient.del(`presence:online:${mockUser1.id}`);
    await redisClient.del(`presence:online:${mockUser2.id}`);

    jwtService = app.get(JwtService);
    token1 = jwtService.sign({ sub: mockUser1.id, email: mockUser1.email, roles: mockUser1.roles });
    token2 = jwtService.sign({ sub: mockUser2.id, email: mockUser2.email, roles: mockUser2.roles });

    await app.listen(0);
    const address = app.getHttpServer().address();
    port = typeof address === 'string' ? 3000 : address.port;
  });

  afterAll(async () => {
    if (socket1) socket1.close();
    if (socket2) socket2.close();
    await app.close();
  });

  describe('REST Endpoints', () => {
    it('GET /api/v1/chat/conversations - should retrieve conversation feed', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/chat/conversations')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('GET /api/v1/chat/presence/:userId - should retrieve user presence', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/chat/presence/${mockUser2.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('userId', mockUser2.id);
      expect(response.body.data).toHaveProperty('isOnline');
    });

    it('POST /api/v1/chat/block/:userId - should block a user', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/chat/block/${mockUser2.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(201);
    });

    it('DELETE /api/v1/chat/block/:userId - should unblock a user', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/chat/block/${mockUser2.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);
    });
  });

  describe('Real-time Socket.IO Gateway', () => {
    it('should establish websocket connection and authorize client using JWT', (done) => {
      socket1 = io(`http://localhost:${port}`, {
        extraHeaders: {
          Authorization: `Bearer ${token1}`,
        },
      });

      socket1.on('connect', () => {
        expect(socket1.connected).toBe(true);
        done();
      });

      socket1.on('connect_error', (err) => {
        done(err);
      });
    });

    it('should track user online presence and emit events', (done) => {
      socket1.on('user_online', (data) => {
        console.log('Received user_online event:', data);
        if (data.userId === mockUser2.id) {
          expect(data).toHaveProperty('userId', mockUser2.id);
          done();
        }
      });

      socket2 = io(`http://localhost:${port}`, {
        extraHeaders: {
          Authorization: `Bearer ${token2}`,
        },
        forceNew: true,
      });

      socket2.on('connect', () => {
        console.log('Socket2 connected successfully');
      });

      socket2.on('connect_error', (err) => {
        console.error('Socket2 connection error:', err);
        done(err);
      });
    }, 10000);
  });
});
