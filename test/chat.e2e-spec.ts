import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { io, Socket } from 'socket.io-client';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { cleanupDatabase, createTestUser } from './test-utils';
import { UserRole } from '@prisma/client';

describe('Chat (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let userSocket: Socket;
  let adminSocket: Socket;
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

    // Setup WebSocket connections
    const httpServer = app.getHttpServer();
    userSocket = io(`http://localhost:${httpServer.address().port}`, {
      auth: { token: `Bearer ${userToken}` },
    });

    adminSocket = io(`http://localhost:${httpServer.address().port}`, {
      auth: { token: `Bearer ${adminToken}` },
    });
  });

  afterAll(async () => {
    userSocket.close();
    adminSocket.close();
    await cleanupDatabase(prismaService);
    await prismaService.$disconnect();
    await app.close();
  });


  it('should connect to WebSocket server', done => {
    userSocket.on('connect', () => {
      expect(userSocket.connected).toBeTruthy();
      done();
    });
  });

  it('should send and receive messages', done => {
    const roomId = 'test-room';
    const message = 'Test message';

    adminSocket.on('message', data => {
      expect(data.content).toBe(message);
      done();
    });

    userSocket.emit('joinRoom', { roomId });
    adminSocket.emit('joinRoom', { roomId });
    userSocket.emit('sendMessage', { roomId, message });
  });

  it('should close chat room (admin only)', () => {
    return request(app.getHttpServer())
      .post('/chat/rooms/1/close')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ summary: 'Chat closed' })
      .expect(200)
      .expect(res => {
        expect(res.body.isOpen).toBeFalsy();
        expect(res.body.summary).toBe('Chat closed');
      });
  });
});