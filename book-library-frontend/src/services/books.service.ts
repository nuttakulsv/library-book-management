import { api, API_URL } from '@/lib/axios';
import type {
  ApiResponse,
  Book,
  BookCoverSource,
  BorrowedBook,
  AdminBorrowRecord,
  AdminBorrowRecordWithUser,
  CreateBookInput,
  PaginatedResponse,
  PaginationParams,
  UpdateBookInput,
} from '@/lib/types';

function unwrap<T>(res: ApiResponse<T> | T): T {
  if (res && typeof res === 'object' && 'status' in res && 'data' in res) {
    return (res as ApiResponse<T>).data;
  }
  return res as T;
}

export const booksService = {
  async getBooks(search?: string): Promise<Book[]> {
    const { data } = await api.get<ApiResponse<Book[]> | Book[]>('/books', {
      params: search ? { search } : undefined,
    });
    return unwrap(data);
  },

  async getBooksPaginated(
    params?: PaginationParams & { search?: string },
  ): Promise<PaginatedResponse<Book>> {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Book>> | PaginatedResponse<Book>>(
      '/books',
      {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
          search: params?.search,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        },
      },
    );
    return unwrap(data);
  },

  async getBook(id: number): Promise<Book> {
    const { data } = await api.get<ApiResponse<Book> | Book>(`/books/${id}`);
    return unwrap(data);
  },

  async getMyBorrowed(): Promise<BorrowedBook[]> {
    const { data } = await api.get<ApiResponse<BorrowedBook[]> | BorrowedBook[]>('/books/borrowed/my');
    return unwrap(data);
  },

  async createBook(
    input: CreateBookInput,
    coverFile?: File,
    coverImageId?: number
  ): Promise<ApiResponse<Book>> {
    const formData = new FormData();
    formData.append('title', input.title);
    formData.append('author', input.author);
    formData.append('isbn', input.isbn);
    formData.append('publicationYear', String(input.publicationYear));
    if (input.totalQuantity) {
      formData.append('totalQuantity', String(input.totalQuantity));
    }
    if (coverFile) {
      formData.append('coverImage', coverFile);
    }
    if (coverImageId != null) {
      formData.append('coverImageId', String(coverImageId));
    }
    const { data } = await api.post<ApiResponse<Book>>('/books', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data as ApiResponse<Book>;
  },

  async updateBook(
    id: number,
    input: UpdateBookInput,
    coverFile?: File,
    coverImageId?: number,
    removeCover?: boolean
  ): Promise<ApiResponse<Book>> {
    const formData = new FormData();
    if (input.title) formData.append('title', input.title);
    if (input.author) formData.append('author', input.author);
    if (input.isbn) formData.append('isbn', input.isbn);
    if (input.publicationYear)
      formData.append('publicationYear', String(input.publicationYear));
    if (input.totalQuantity !== undefined)
      formData.append('totalQuantity', String(input.totalQuantity));
    if (coverFile) formData.append('coverImage', coverFile);
    if (coverImageId != null) formData.append('coverImageId', String(coverImageId));
    if (removeCover) formData.append('removeCover', 'true');
    const { data } = await api.put<ApiResponse<Book>>(`/books/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data as ApiResponse<Book>;
  },

  async deleteBook(id: number): Promise<ApiResponse<null>> {
    const { data } = await api.delete<ApiResponse<null>>(`/books/${id}`);
    return data ?? { status: 'success', data: null };
  },

  async borrowBook(id: number): Promise<ApiResponse<Book>> {
    const { data } = await api.post<ApiResponse<Book>>(`/books/${id}/borrow`);
    return data as ApiResponse<Book>;
  },

  async returnBook(id: number): Promise<ApiResponse<Book>> {
    const { data } = await api.post<ApiResponse<Book>>(`/books/${id}/return`);
    return data as ApiResponse<Book>;
  },

  /** Admin: รายการยืมของ user คนใดคนหนึ่ง */
  async getBorrowedByUserId(userId: number): Promise<AdminBorrowRecord[]> {
    const { data } = await api.get<ApiResponse<AdminBorrowRecord[]> | AdminBorrowRecord[]>(
      `/books/borrowed/by-user/${userId}`,
    );
    return unwrap(data);
  },

  /** Admin: รายการยืมทั้งหมดที่ยังไม่คืน */
  async getAllBorrowed(): Promise<AdminBorrowRecordWithUser[]> {
    const { data } = await api.get<ApiResponse<AdminBorrowRecordWithUser[]> | AdminBorrowRecordWithUser[]>(
      '/books/borrowed/all',
    );
    return unwrap(data);
  },

  /** Admin: รายการยืมทั้งหมด (พร้อม pagination, search) */
  async getAllBorrowedPaginated(
    params?: PaginationParams & { search?: string },
  ): Promise<PaginatedResponse<AdminBorrowRecordWithUser>> {
    const { data } = await api.get<
      ApiResponse<PaginatedResponse<AdminBorrowRecordWithUser>> | PaginatedResponse<AdminBorrowRecordWithUser>
    >('/books/borrowed/all', {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        search: params?.search,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
      },
    });
    return unwrap(data);
  },

  /** Admin: รับคืนหนังสือตาม record id */
  async adminReturnRecord(recordId: number): Promise<ApiResponse<unknown>> {
    const { data } = await api.post<ApiResponse<unknown>>(
      `/books/borrowed/${recordId}/return`,
    );
    return data as ApiResponse<unknown>;
  },
};

/**
 * สร้าง URL สำหรับแสดงรูปปกหนังสือ
 * รองรับทั้ง coverImageId (Master Images) และ coverImage (legacy path)
 * คืนค่า placeholder เมื่อไม่มีรูป
 */
export function getCoverUrl(book: BookCoverSource): string {
  if (book.coverImageId != null) {
    return `${API_URL}/images/${book.coverImageId}/file`;
  }
  if (book.coverImage) {
    const base = book.coverImage.startsWith('http') ? '' : API_URL;
    return `${base}${book.coverImage}`;
  }
  return '/book-placeholder.svg';
}
