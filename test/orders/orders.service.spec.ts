import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from '../../src/orders/orders.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { ChatService } from '../../src/chat/chat.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { OrderStatus, UserRole } from '@prisma/client';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: PrismaService;
  let chatService: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: {
            order: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
          },
        },
        {
          provide: ChatService,
          useValue: {
            createChatRoom: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);
    chatService = module.get<ChatService>(ChatService);
  });

  describe('create', () => {
    it('should create an order and chat room', async () => {
      const createOrderDto = {
        description: 'Test order',
        specifications: { type: 'test' },
        quantity: 1,
      };

      const expectedOrder = {
        id: '123',
        ...createOrderDto,
        userId: 'user123',
        status: OrderStatus.REVIEW,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      jest.spyOn(prisma.order, 'create').mockResolvedValue(expectedOrder);
      jest.spyOn(chatService, 'createChatRoom').mockResolvedValue({
        id: 'chat123',
        orderId: expectedOrder.id,
        isOpen: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        summary: '',
        closedAt: new Date(),
      });

      const result = await service.create('user123', createOrderDto);
      expect(result).toEqual(expectedOrder);
      expect(chatService.createChatRoom).toHaveBeenCalledWith(expectedOrder.id);
    });
  });

  describe('findAll', () => {
    it('should return paginated orders for admin', async () => {
      const orders = [
        {
          id: '1',
          description: 'Order 1',
          specifications: { type: 'test' },
          quantity: 1,
          status: OrderStatus.REVIEW,
          metadata: {},
          userId: 'user1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          description: 'Order 2',
          specifications: { type: 'test' },
          quantity: 2,
          status: OrderStatus.REVIEW,
          metadata: {},
          userId: 'user2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(prisma.order, 'findMany').mockResolvedValue(orders);
      jest.spyOn(prisma.order, 'count').mockResolvedValue(2);

      const result = await service.findAll('admin123', UserRole.ADMIN, {
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual(orders);
      expect(result.total).toBe(2);
    });

    it('should return only user orders for regular users', async () => { 
      const orders = [{
        id: '1',
        description: 'Order 1',
        specifications: { type: 'test' },
        quantity: 1,
        status: OrderStatus.REVIEW,
        metadata: {},
        userId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }];

      jest.spyOn(prisma.order, 'findMany').mockResolvedValue(orders);
      jest.spyOn(prisma.order, 'count').mockResolvedValue(1);

      const result = await service.findAll('user123', UserRole.USER, {
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual(orders);
      expect(result.total).toBe(1);
    });
  });

  describe('updateStatus', () => {
    it('should update order status', async () => {
      const order = {
        id: '123',
        description: 'Test order',
        specifications: { type: 'test' },
        quantity: 1,
        status: OrderStatus.REVIEW,
        metadata: {},
        userId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date(),
        chatRoom: { isOpen: false },
      };

      const updatedOrder = {
        ...order,
        status: OrderStatus.PROCESSING,
      };

      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(order);
      jest.spyOn(prisma.order, 'update').mockResolvedValue(updatedOrder);

      const result = await service.updateStatus('123', OrderStatus.PROCESSING);
      expect(result).toEqual(updatedOrder);
    });

    it('should throw ForbiddenException when moving to PROCESSING with open chat', async () => {
      const order = {
        id: '123',
        description: 'Test order',
        specifications: { type: 'test' },
        quantity: 1,
        status: OrderStatus.REVIEW,
        metadata: {},
        userId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date(),
        chatRoom: { isOpen: false },
      };

      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(order);

      await expect(
        service.updateStatus('123', OrderStatus.PROCESSING),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});