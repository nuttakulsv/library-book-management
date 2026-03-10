export type SortOrder = 'asc' | 'desc';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export function parsePaginationParams(query: {
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: string;
}): { page: number; limit: number; sortBy: string; sortOrder: SortOrder } {
  const page = Math.max(1, parseInt(String(query.page || 1), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || 20), 10) || 20));
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
  return {
    page,
    limit,
    sortBy: query.sortBy || 'createdAt',
    sortOrder,
  };
}

export function fromPaginationQuery(
  query: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string },
  defaults?: { sortBy?: string; sortOrder?: SortOrder },
): { page: number; limit: number; search?: string; sortBy: string; sortOrder: SortOrder } {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 20));
  const sortOrder: SortOrder = query.sortOrder === 'asc' ? 'asc' : (defaults?.sortOrder ?? 'desc');
  return {
    page,
    limit,
    search: query.search?.trim() || undefined,
    sortBy: query.sortBy || defaults?.sortBy || 'createdAt',
    sortOrder,
  };
}

export function createPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
