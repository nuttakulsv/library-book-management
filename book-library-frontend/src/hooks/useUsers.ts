import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/services/users.service';
import type { UsersQueryParams } from '@/lib/types';

export const usersKeys = {
  all: ['users'] as const,
  list: (q?: string) => [...usersKeys.all, 'list', q ?? ''] as const,
  listPaginated: (params?: UsersQueryParams) =>
    [...usersKeys.all, 'list-paginated', params ?? {}] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: usersKeys.list(),
    queryFn: () => usersService.getUsers(),
  });
}

export function useSearchUsers(q: string) {
  return useQuery({
    queryKey: usersKeys.list(q),
    queryFn: () => usersService.getUsers(q),
    enabled: q.trim().length > 0,
  });
}

export function useUsersPaginated(params?: UsersQueryParams) {
  return useQuery({
    queryKey: usersKeys.listPaginated(params),
    queryFn: () => usersService.getUsersPaginated(params),
  });
}
