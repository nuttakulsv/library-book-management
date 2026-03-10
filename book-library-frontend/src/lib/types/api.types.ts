export interface ApiResponse<T> {
  status: 'success';
  data: T;
}

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

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Params สำหรับ query รูปภาพ */
export type ImagesQueryParams = PaginationParams;

/** Params สำหรับ query ผู้ใช้ */
export interface UsersQueryParams extends PaginationParams {
  q?: string;
}
