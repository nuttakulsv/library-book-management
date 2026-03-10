import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { fromPaginationQuery } from '../common/types/pagination.types';
import { UsersService } from './users.service';
import type { PaginatedResponse } from '../common/types/pagination.types';
import type { UserListItem } from './users.service';
import { UsersQueryDto } from './dto/users-query.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, AdminGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Query() query: UsersQueryDto,
  ): Promise<UserListItem[] | PaginatedResponse<UserListItem>> {
    const usePagination = query.page !== undefined || query.limit !== undefined;
    const search = query.q?.trim() || query.search?.trim() || undefined;

    if (usePagination) {
      const { page, limit, sortBy, sortOrder } = fromPaginationQuery(query, {
        sortBy: 'createdAt',
      });
      return this.usersService.findAllPaginated(search, page, limit, sortBy, sortOrder);
    }
    if (search) {
      return this.usersService.searchUsers(search);
    }
    return this.usersService.findAll();
  }
}
