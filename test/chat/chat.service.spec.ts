import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from '../../src/chat/chat.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

describe('ChatService', () => {
  let service: ChatService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: PrismaService,
          useValue: {
            chatRoom: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            message: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('createChatRoom', () => {
    it('should create a chat room', async () => {
      const orderId = '123';
      const expectedChatRoom = {
        id: '456',
        orderId,
        isOpen: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        summary: '',
        closedAt: new Date(),
      };

      jest.spyOn(prisma.chatRoom, 'create').mockResolvedValue(expectedChatRoom);

      const result = await service.createChatRoom(orderId);
      expect(result).toEqual(expectedChatRoom);
    });
  });

  describe('findChatRoom', () => {
    it('should return chat room for admin', async () => {
      const chatRoom = {
        id: '123',
        orderId: 'order123',
        isOpen: true,
        summary: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        closedAt: new Date(),
        order: { userId: 'user123' },
        messages: [],
      };

      jest.spyOn(prisma.chatRoom, 'findUnique').mockResolvedValue(chatRoom);

      const result = await service.findChatRoom('123', 'admin123', UserRole.ADMIN);
      expect(result).toEqual(chatRoom);
    });

    it('should throw NotFoundException when chat room not found', async () => {
      jest.spyOn(prisma.chatRoom, 'findUnique').mockResolvedValue(null);

      await expect(
        service.findChatRoom('123', 'user123', UserRole.USER),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for unauthorized access', async () => {
      const chatRoom = {
        id: '123',
        orderId: 'order123',
        isOpen: true,
        summary: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        closedAt: new Date(),
        order: { userId: 'otherUser' },
        messages: [],
      };

      jest.spyOn(prisma.chatRoom, 'findUnique').mockResolvedValue(chatRoom);

      await expect(
        service.findChatRoom('123', 'user123', UserRole.USER),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createMessage', () => {
    it('should create a message in an open chat room', async () => {
      const chatRoom = {
        id: '123',
        orderId: 'order123',
        isOpen: true,
        summary: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        closedAt: new Date(),
        order: { userId: 'user123' },
      };

      const message = {
        id: '456',
        content: 'Test message',
        user: { id: 'user123' },
        createdAt: new Date(),
        userId: 'user123',
        chatRoomId: '123',
      };

      jest.spyOn(prisma.chatRoom, 'findUnique').mockResolvedValue(chatRoom);
      jest.spyOn(prisma.message, 'create').mockResolvedValue(message);

      const result = await service.createMessage('123', 'user123', {
        content: 'Test message',
      });
      expect(result).toEqual(message);
    });

    it('should throw ForbiddenException for closed chat room', async () => {
      const chatRoom = {
        id: '123',
        isOpen: false,
        order: { userId: 'user123' },
        orderId: 'order123',
        summary: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        closedAt: new Date(),
      };

      jest.spyOn(prisma.chatRoom, 'findUnique').mockResolvedValue(chatRoom);

      await expect(
        service.createMessage('123', 'user123', { content: 'Test message' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});