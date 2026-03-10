import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const mockUserListItem = {
    id: 1,
    memberId: 'M001',
    username: 'testuser',
    email: 'test@example.com',
    isAdministration: false,
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  const mockPaginatedResponse = {
    data: [mockUserListItem],
    meta: { total: 1, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false },
  };

  beforeEach(async () => {
    const mockUsersService = {
      findAll: jest.fn(),
      searchUsers: jest.fn(),
      findAllPaginated: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users when no pagination and no search', async () => {
      usersService.findAll.mockResolvedValue([mockUserListItem]);

      const result = await controller.findAll({});
      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockUserListItem]);
    });

    it('should return paginated users when page/limit provided', async () => {
      usersService.findAllPaginated.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll({ page: 1, limit: 20 });
      expect(usersService.findAllPaginated).toHaveBeenCalledWith(
        undefined,
        1,
        20,
        'createdAt',
        'desc',
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should use q as search when provided', async () => {
      usersService.findAllPaginated.mockResolvedValue(mockPaginatedResponse);

      await controller.findAll({ page: 1, limit: 20, q: 'admin' });
      expect(usersService.findAllPaginated).toHaveBeenCalledWith(
        'admin',
        1,
        20,
        'createdAt',
        'desc',
      );
    });

    it('should call searchUsers when q provided without pagination', async () => {
      usersService.searchUsers.mockResolvedValue([mockUserListItem]);

      const result = await controller.findAll({ q: 'test' });
      expect(usersService.searchUsers).toHaveBeenCalledWith('test');
      expect(result).toEqual([mockUserListItem]);
    });
  });
});
