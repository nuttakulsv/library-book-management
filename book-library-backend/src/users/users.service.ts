import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PaginatedResponse,
  createPaginationMeta,
} from '../common/types/pagination.types';
import { User } from '../entities/user.entity';

export interface UserListItem {
  id: number;
  memberId?: string;
  username: string;
  email?: string;
  isAdministration: boolean;
  createdAt: string;
}

function toUserListItem(u: User): UserListItem {
  return {
    id: u.id,
    memberId: u.memberId,
    username: u.username,
    email: u.email,
    isAdministration: u.isAdministration,
    createdAt: u.createdAt.toISOString(),
  };
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<UserListItem[]> {
    const users = await this.userRepository.find({
      order: { createdAt: 'DESC' },
      select: ['id', 'memberId', 'username', 'email', 'isAdministration', 'createdAt'],
    });
    return users.map(toUserListItem);
  }

  async searchUsers(search: string): Promise<UserListItem[]> {
    const result = await this.findAllPaginated(search, 1, 1000);
    return result.data;
  }

  async findAllPaginated(
    search?: string,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<PaginatedResponse<UserListItem>> {
    const qb = this.userRepository.createQueryBuilder('user');
    qb.select(['user.id', 'user.memberId', 'user.username', 'user.email', 'user.isAdministration', 'user.createdAt']);

    if (search?.trim()) {
      const q = `%${search.trim()}%`;
      qb.where(
        'user.username ILIKE :q OR user.member_id ILIKE :q OR user.email ILIKE :q',
        { q },
      );
    }

    const allowedSort: Record<string, string> = {
      username: 'user.username',
      memberId: 'user.member_id',
      email: 'user.email',
      createdAt: 'user.created_at',
      isAdministration: 'user.is_administration',
    };
    const orderBy = allowedSort[sortBy] || 'user.created_at';
    qb.orderBy(orderBy, sortOrder === 'asc' ? 'ASC' : 'DESC');

    const [users, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: users.map(toUserListItem),
      meta: createPaginationMeta(total, page, limit),
    };
  }
}
