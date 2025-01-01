import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole, OrderStatus } from '@prisma/client';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: OrdersService;

  const mockOrdersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new order', async () => {
      const mockRequest = { user: { id: '1' } };
      const createOrderDto: CreateOrderDto = {
        description: 'Test order',
        specifications: { color: 'blue' },
        quantity: 1,
        metadata: { priority: 'high' }
      };
      const expectedResult = { 
        id: 'order-1',
        ...createOrderDto,
        userId: mockRequest.user.id 
      };

      mockOrdersService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(mockRequest, createOrderDto);

      expect(ordersService.create).toHaveBeenCalledWith(
        mockRequest.user.id,
        createOrderDto
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      const mockRequest = { user: { id: '1', role: UserRole.USER } };
      const expectedResult = [
        { id: 'order-1', description: 'Test order 1' },
        { id: 'order-2', description: 'Test order 2' }
      ];

      mockOrdersService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(mockRequest);

      expect(ordersService.findAll).toHaveBeenCalledWith(
        mockRequest.user.id,
        mockRequest.user.role,
        { page: 1, limit: 10 }
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a single order', async () => {
      const mockRequest = { user: { id: '1', role: UserRole.USER } };
      const orderId = 'order-123';
      const expectedResult = { 
        id: orderId,
        description: 'Test order'
      };

      mockOrdersService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(orderId, mockRequest);

      expect(ordersService.findOne).toHaveBeenCalledWith(
        orderId,
        mockRequest.user.id,
        mockRequest.user.role
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateStatus', () => {
    it('should update order status', async () => {
      const orderId = 'order-123';
      const updateOrderStatusDto: UpdateOrderStatusDto = {
        status: OrderStatus.COMPLETED
      };
      const expectedResult = { 
        id: orderId,
        status: OrderStatus.COMPLETED
      };

      mockOrdersService.updateStatus.mockResolvedValue(expectedResult);

      const result = await controller.updateStatus(orderId, updateOrderStatusDto);

      expect(ordersService.updateStatus).toHaveBeenCalledWith(
        orderId,
        updateOrderStatusDto.status
      );
      expect(result).toEqual(expectedResult);
    });
  });
});