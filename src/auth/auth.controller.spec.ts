import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Test, TestingModule } from '@nestjs/testing';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService
        }
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login with user data', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123'
      };
      const mockUser = { id: 1, email: loginDto.email };
      const mockRequest = { user: mockUser };
      const expectedResult = { access_token: 'token' };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(mockRequest, loginDto);

      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(expectedResult);
    });
  });
});