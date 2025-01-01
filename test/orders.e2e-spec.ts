import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { cleanupDatabase, createTestUser } from './test-utils';

describe('Orders (e2e)', () => {
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

  it('should create a new order', () => {
    return request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        description: 'Test order',
        specifications: { type: 'test' },
        quantity: 1,
      })
      .expect(201)
      .expect(res => {
        expect(res.body.id).toBeDefined();
        expect(res.body.chatRoom).toBeDefined();
      });
  });

  it('should not allow non-admin to update order status', () => {
    return request(app.getHttpServer())
      .patch('/orders/1/status')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'PROCESSING' })
      .expect(403);
  });

  it('should allow admin to update order status', () => {
    return request(app.getHttpServer())
      .patch('/orders/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PROCESSING' })
      .expect(200);
  });
});