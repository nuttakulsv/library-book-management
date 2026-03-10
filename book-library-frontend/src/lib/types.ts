export type {
  User,
  ISession,
  UserListItem,
  AuthResponse,
  AuthContextType,
  Book,
  CreateBookInput,
  CreateBookMutationInput,
  UpdateBookInput,
  UpdateBookMutationInput,
  BorrowedBook,
  AdminBorrowRecord,
  AdminBorrowRecordWithUser,
  BookCoverSource,
  Image,
  ApiResponse,
  PaginationMeta,
  PaginatedResponse,
  PaginationParams,
  ImagesQueryParams,
  UsersQueryParams,
  ApiError,
  ToastType,
  Toast,
  ToastContextType,
} from './types/index';

import type { ApiError } from './types/error.types';

const NETWORK_ERROR_PHRASES = ['Network Error', 'ERR_NETWORK', 'Network request failed'];

function isNetworkError(msg: string | undefined): boolean {
  if (!msg) return false;
  return NETWORK_ERROR_PHRASES.some((p) => msg.includes(p));
}

export function getErrorMessage(error: unknown): string {
  const err = error as ApiError;
  const msg = err?.response?.data?.message;
  const raw: string =
    err?.message ||
    err?.description ||
    err?.error_message ||
    (Array.isArray(msg) ? msg[0] : msg) ||
    err?.response?.data?.description ||
    'เกิดข้อผิดพลาด';
  const str = typeof raw === 'string' ? raw : String(raw);
  if (isNetworkError(str)) {
    return 'ไม่สามารถเชื่อมต่อกับระบบได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือลองใหม่อีกครั้ง';
  }
  return str;
}
