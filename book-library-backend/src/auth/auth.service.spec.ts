import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { AuthService } from './auth.service';

const mockBcryptCompare = jest.fn().mockResolvedValue(true);
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: (...args: unknown[]) => mockBcryptCompare(...args),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser: Partial<User> = {
    id: 1,
    memberId: 'MKO3CK1EC96',
    username: 'testuser',
    email: undefined,
    password: 'password123',
    isAdministration: false,
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    mockBcryptCompare.mockResolvedValue(true);
    const mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    const mockJwtService = {
      sign: jest.fn().mockReturnValue('jwt-token-123'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return token', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);
      (userRepository.create as jest.Mock).mockReturnValue(mockUser);
      (userRepository.save as jest.Mock).mockResolvedValue({
        ...mockUser,
        id: 1,
        createdAt: new Date('2024-01-01'),
      });

      const result = await service.register({
        username: 'testuser',
        password: 'password123',
      });

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException when username exists', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        service.register({ username: 'testuser', password: 'password123' }),
      ).rejects.toThrow(ConflictException);
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login and return token for valid credentials', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.login({
        username: 'testuser',
        password: 'password123',
      });

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: [{ username: 'testuser' }, { email: 'testuser' }],
      });
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid username', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.login({ username: 'wronguser', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockBcryptCompare.mockResolvedValueOnce(false);
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        service.login({ username: 'testuser', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should do nothing (JWT stateless - client ลบ token เอง)', async () => {
      await service.logout();
      expect(userRepository.findOne).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });
});
