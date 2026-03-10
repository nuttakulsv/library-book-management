import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthResponse = {
    token: 'abc123',
    user: {
      id: 1,
      memberId: 'M001',
      username: 'testuser',
      email: undefined,
      isAdministration: false,
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  };

  const mockAuthUser = {
    id: 1,
    memberId: 'M001',
    username: 'testuser',
    email: undefined,
    isAdministration: false,
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSession', () => {
    it('should return session when user is authenticated', async () => {
      const req = { user: mockAuthUser } as Request;
      const result = await controller.getSession(req);
      expect(result).toEqual({
        id: 1,
        memberId: 'M001',
        username: 'testuser',
        email: undefined,
        isAdministration: false,
        createdAt: '2024-01-01T00:00:00.000Z',
      });
    });

    it('should throw UnauthorizedException when user is not in request', async () => {
      const req = {} as Request;
      await expect(controller.getSession(req)).rejects.toThrow(UnauthorizedException);
      await expect(controller.getSession(req)).rejects.toThrow('User not found');
    });
  });

  describe('register', () => {
    it('should call authService.register and return result', async () => {
      authService.register.mockResolvedValue(mockAuthResponse);
      const dto = { username: 'newuser', password: 'pass123' };

      const result = await controller.register(dto);
      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('login', () => {
    it('should call authService.login and return result', async () => {
      authService.login.mockResolvedValue(mockAuthResponse);
      const dto = { username: 'testuser', password: 'pass123' };

      const result = await controller.login(dto);
      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('logout', () => {
    it('should call authService.logout and return success message', async () => {
      const result = await controller.logout();
      expect(authService.logout).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});
