'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  ApiResponse,
  CreateBookMutationInput,
  PaginationParams,
  UpdateBookMutationInput,
} from '@/lib/types';
import { getErrorMessage } from '@/lib/types';
import { useToast } from '@/contexts/ToastContext';
import { booksService } from '@/services/books.service';

export const booksKeys = {
  all: ['books'] as const,
  lists: () => [...booksKeys.all, 'list'] as const,
  list: (search?: string) =>
    [...booksKeys.lists(), search ?? ''] as const,
  listPaginated: (params?: PaginationParams) =>
    [...booksKeys.all, 'list-paginated', params ?? {}] as const,
  details: () => [...booksKeys.all, 'detail'] as const,
  detail: (id: number) => [...booksKeys.details(), id] as const,
  borrowed: () => [...booksKeys.all, 'borrowed'] as const,
  borrowedByUser: (userId: number) =>
    [...booksKeys.all, 'borrowed', 'by-user', userId] as const,
  borrowedAll: () => [...booksKeys.all, 'borrowed', 'all'] as const,
  borrowedAllPaginated: (params?: PaginationParams) =>
    [...booksKeys.all, 'borrowed', 'all-paginated', params ?? {}] as const,
};

export function useBooks(search?: string) {
  return useQuery({
    queryKey: booksKeys.list(search),
    queryFn: () => booksService.getBooks(search),
  });
}

export function useBooksPaginated(params?: PaginationParams) {
  return useQuery({
    queryKey: booksKeys.listPaginated(params),
    queryFn: () => booksService.getBooksPaginated(params),
  });
}

export function useBook(id: number) {
  return useQuery({
    queryKey: booksKeys.detail(id),
    queryFn: () => booksService.getBook(id),
    enabled: !!id,
  });
}

export function useBorrowedBooks() {
  return useQuery({
    queryKey: booksKeys.borrowed(),
    queryFn: () => booksService.getMyBorrowed(),
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: ({ data, coverFile, coverImageId }: CreateBookMutationInput) =>
      booksService.createBook(data, coverFile, coverImageId),
    onSuccess: (res: ApiResponse<unknown>) => {
      queryClient.invalidateQueries({ queryKey: booksKeys.lists() });
      if (res?.status === 'success') {
        showToast('เพิ่มหนังสือสำเร็จ');
      } else {
        showToast('เพิ่มหนังสือไม่สำเร็จ', 'error');
      }
    },
    onError: (error: unknown) => {
      showToast(getErrorMessage(error), 'error');
    },
  });
}

export function useUpdateBook(id: number) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: ({ data, coverFile, coverImageId, removeCover }: UpdateBookMutationInput) =>
      booksService.updateBook(id, data, coverFile, coverImageId, removeCover),
    onSuccess: (res: ApiResponse<unknown>) => {
      queryClient.invalidateQueries({ queryKey: booksKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: booksKeys.lists() });
      if (res?.status === 'success') {
        showToast('แก้ไขหนังสือสำเร็จ');
      } else {
        showToast('แก้ไขหนังสือไม่สำเร็จ', 'error');
      }
    },
    onError: (error: unknown) => {
      showToast(getErrorMessage(error), 'error');
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (id: number) => booksService.deleteBook(id),
    onSuccess: (res: ApiResponse<unknown>) => {
      queryClient.invalidateQueries({ queryKey: booksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: booksKeys.borrowed() });
      if (res?.status === 'success') {
        showToast('ลบหนังสือสำเร็จ');
      } else {
        showToast('ลบหนังสือไม่สำเร็จ', 'error');
      }
    },
    onError: (error: unknown) => {
      showToast(getErrorMessage(error), 'error');
    },
  });
}

export function useBorrowBook() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (id: number) => booksService.borrowBook(id),
    onSuccess: (res: ApiResponse<unknown>, id) => {
      queryClient.invalidateQueries({ queryKey: booksKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: booksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: booksKeys.borrowed() });
      if (res?.status === 'success') {
        showToast('ยืมหนังสือสำเร็จ');
      } else {
        showToast('ยืมหนังสือไม่สำเร็จ', 'error');
      }
    },
    onError: (error: unknown) => {
      showToast(getErrorMessage(error), 'error');
    },
  });
}

export function useReturnBook() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (id: number) => booksService.returnBook(id),
    onSuccess: (res: ApiResponse<unknown>, id) => {
      queryClient.invalidateQueries({ queryKey: booksKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: booksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: booksKeys.borrowed() });
      if (res?.status === 'success') {
        showToast('คืนหนังสือสำเร็จ');
      } else {
        showToast('คืนหนังสือไม่สำเร็จ', 'error');
      }
    },
    onError: (error: unknown) => {
      showToast(getErrorMessage(error), 'error');
    },
  });
}

export function useBorrowedByUserId(userId: number) {
  return useQuery({
    queryKey: booksKeys.borrowedByUser(userId),
    queryFn: () => booksService.getBorrowedByUserId(userId),
    enabled: !!userId,
  });
}

export function useAllBorrowed() {
  return useQuery({
    queryKey: booksKeys.borrowedAll(),
    queryFn: () => booksService.getAllBorrowed(),
  });
}

export function useAllBorrowedPaginated(params?: PaginationParams) {
  return useQuery({
    queryKey: booksKeys.borrowedAllPaginated(params),
    queryFn: () => booksService.getAllBorrowedPaginated(params),
  });
}

export function useAdminReturnRecord() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (recordId: number) => booksService.adminReturnRecord(recordId),
    onSuccess: (res: ApiResponse<unknown>) => {
      queryClient.invalidateQueries({ queryKey: booksKeys.all });
      if (res?.status === 'success') {
        showToast('รับคืนหนังสือสำเร็จ');
      } else {
        showToast('รับคืนหนังสือไม่สำเร็จ', 'error');
      }
    },
    onError: (error: unknown) => {
      showToast(getErrorMessage(error), 'error');
    },
  });
}
