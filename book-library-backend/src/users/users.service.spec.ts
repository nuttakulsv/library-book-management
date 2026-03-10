import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UsersService, type UserListItem } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser: Partial<User> = {
    id: 1,
    memberId: 'M001',
    username: 'testuser',
    email: 'test@example.com',
    isAdministration: false,
    createdAt: new Date('2024-01-01'),
  };

  const mockUserListItem: UserListItem = {
    id: 1,
    memberId: 'M001',
    username: 'testuser',
    email: 'test@example.com',
    isAdministration: false,
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    const mockRepo = {
      find: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockUser], 1]),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users as UserListItem', async () => {
      (userRepository.find as jest.Mock).mockResolvedValue([mockUser]);

      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 1,
        memberId: 'M001',
        username: 'testuser',
        email: 'test@example.com',
        isAdministration: false,
      });
      expect(result[0].createdAt).toBe('2024-01-01T00:00:00.000Z');
      expect(userRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        select: ['id', 'memberId', 'username', 'email', 'isAdministration', 'createdAt'],
      });
    });

    it('should return empty array when no users', async () => {
      (userRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('searchUsers', () => {
    it('should return users matching search term', async () => {
      const qb = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockUser], 1]),
      };
      (userRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      const result = await service.searchUsers('test');
      expect(result).toHaveLength(1);
      expect(qb.where).toHaveBeenCalledWith(
        'user.username ILIKE :q OR user.member_id ILIKE :q OR user.email ILIKE :q',
        { q: '%test%' },
      );
    });
  });

  describe('findAllPaginated', () => {
    it('should return paginated users with meta', async () => {
      const qb = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockUser], 1]),
      };
      (userRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      const result = await service.findAllPaginated(undefined, 1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toMatchObject({
        id: 1,
        username: 'testuser',
      });
      expect(result.meta).toMatchObject({
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      expect(qb.skip).toHaveBeenCalledWith(0);
      expect(qb.take).toHaveBeenCalledWith(20);
    });

    it('should apply search filter when provided', async () => {
      const qb = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      (userRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      await service.findAllPaginated('admin', 1, 10);
      expect(qb.where).toHaveBeenCalledWith(
        'user.username ILIKE :q OR user.member_id ILIKE :q OR user.email ILIKE :q',
        { q: '%admin%' },
      );
    });

    it('should apply sortBy and sortOrder', async () => {
      const qb = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      (userRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      await service.findAllPaginated(undefined, 1, 20, 'username', 'asc');
      expect(qb.orderBy).toHaveBeenCalledWith('user.username', 'ASC');
    });
  });
});
