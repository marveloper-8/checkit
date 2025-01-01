import { CreateUserDto } from './dto/create-user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.USER
      };
      const expectedResult = {
        id: 'user-1',
        email: createUserDto.email,
        role: createUserDto.role
      };

      mockUsersService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createUserDto);

      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const expectedResult = [
        { id: 'user-1', email: 'user1@example.com', role: UserRole.USER },
        { id: 'user-2', email: 'user2@example.com', role: UserRole.ADMIN }
      ];

      mockUsersService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });
});