import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { OrderStatus, UserRole } from '@prisma/client';
import { cleanupDatabase, createTestUser } from './test-utils';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = app.get<PrismaService>(PrismaService);
    
    // Setup validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));

    await app.init();

    // Clean database and create test users
    await cleanupDatabase(prismaService);
    await createTestUser(prismaService, UserRole.USER);
    await createTestUser(prismaService, UserRole.ADMIN);

    // Get authentication tokens
    const userResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@test.com', password: 'password123' });
    userToken = userResponse.body.access_token;

    const adminResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    adminToken = adminResponse.body.access_token;
  });

  afterAll(async () => {
    await cleanupDatabase(prismaService);
    await prismaService.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterEach(async () => {
  });

  it('/auth/login (POST) - should authenticate user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(201);

    userToken = response.body.access_token;
    expect(userToken).toBeDefined();
  });

  describe('Orders', () => {
    let orderId: string;
    let chatRoomId: string;

    it('should create new order', async () => {
      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          description: 'Test order',
          specifications: { type: 'test' },
          quantity: 1,
        })
        .expect(201);

      orderId = response.body.id;
      chatRoomId = response.body.chatRoom.id;
      expect(response.body.status).toBe('REVIEW');
    });

    it('should get order by id', () => {
      return request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.id).toBe(orderId);
          expect(res.body.chatRoom).toBeDefined();
        });
    });

    it('should fail to get non-existent order', () => {
      return request(app.getHttpServer())
        .get('/orders/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);
    });

    it('should fail to update order status as regular user', () => {
      return request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: OrderStatus.PROCESSING })
        .expect(403);
    });

    it('should update order status as admin', () => {
      return request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: OrderStatus.PROCESSING })
        .expect(200)
        .expect(res => {
          expect(res.body.status).toBe('PROCESSING');
        });
    });

    it('should fail to update status to PROCESSING with open chat', async () => {
      const newOrder = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          description: 'Test order 2',
          specifications: { type: 'test' },
          quantity: 1,
        })
        .expect(201);

      return request(app.getHttpServer())
        .patch(`/orders/${newOrder.body.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: OrderStatus.PROCESSING })
        .expect(403);
    });
  });

  describe('Chat', () => {
    let chatRoomId: string;
    let orderId: string;

    beforeEach(async () => {
      // Create a new order for each test
      const order = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          description: 'Chat test order',
          specifications: { type: 'test' },
          quantity: 1,
        });

      orderId = order.body.id;
      chatRoomId = order.body.chatRoom.id;
    });

    it('should get chat room details', () => {
      return request(app.getHttpServer())
        .get(`/chat/rooms/${chatRoomId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.id).toBe(chatRoomId);
          expect(res.body.orderId).toBe(orderId);
          expect(res.body.isOpen).toBe(true);
        });
    });

    it('should create and retrieve messages', async () => {
      // Create message
      await request(app.getHttpServer())
        .post(`/chat/rooms/${chatRoomId}/messages`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: 'Test message 1' })
        .expect(201);

      // Get chat room with messages
      return request(app.getHttpServer())
        .get(`/chat/rooms/${chatRoomId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.messages).toHaveLength(1);
          expect(res.body.messages[0].content).toBe('Test message 1');
        });
    });

    it('should prevent messaging in closed chat room', async () => {
      // Close chat room
      await request(app.getHttpServer())
        .post(`/chat/rooms/${chatRoomId}/close`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ summary: 'Chat closed' })
        .expect(200);

      // Try to send message
      return request(app.getHttpServer())
        .post(`/chat/rooms/${chatRoomId}/messages`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: 'Test message' })
        .expect(403);
    });

    it('should prevent non-admin from closing chat room', () => {
      return request(app.getHttpServer())
        .post(`/chat/rooms/${chatRoomId}/close`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ summary: 'Chat closed' })
        .expect(403);
    });

    it('should prevent accessing another user\'s chat room', async () => {
      // Create another user
      const anotherUser = await prismaService.user.create({
        data: {
          email: 'another@example.com',
          password: '$2b$10$test',
          role: UserRole.USER,
        },
      });

      // Get token for another user
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'another@example.com', password: 'password' });

      const anotherUserToken = loginResponse.body.access_token;

      // Try to access chat room
      return request(app.getHttpServer())
        .get(`/chat/rooms/${chatRoomId}`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .expect(403);
    });
  });
});