import { api } from '@/lib/axios';
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  UserListItem,
} from '@/lib/types';

function unwrap<T>(res: ApiResponse<T> | T): T {
  if (res && typeof res === 'object' && 'status' in res && 'data' in res) {
    return (res as ApiResponse<T>).data;
  }
  return res as T;
}

export const usersService = {
  async getUsers(q?: string): Promise<UserListItem[]> {
    const { data } = await api.get<ApiResponse<UserListItem[]> | UserListItem[]>('/users', {
      params: q?.trim() ? { q: q.trim() } : undefined,
    });
    return unwrap(data);
  },

  async getUsersPaginated(
    params?: PaginationParams & { q?: string },
  ): Promise<PaginatedResponse<UserListItem>> {
    const { data } = await api.get<
      ApiResponse<PaginatedResponse<UserListItem>> | PaginatedResponse<UserListItem>
    >('/users', {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        q: params?.q,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
      },
    });
    return unwrap(data);
  },
};
