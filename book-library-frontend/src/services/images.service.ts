import { api, API_URL } from '@/lib/axios';
import type { ApiResponse, Image, PaginatedResponse, PaginationParams } from '@/lib/types';

function unwrap<T>(res: ApiResponse<T> | T): T {
  if (res && typeof res === 'object' && 'status' in res && 'data' in res) {
    return (res as ApiResponse<T>).data;
  }
  return res as T;
}

/** สร้าง URL สำหรับแสดงรูปจาก id */
export function getImageFileUrl(imageId: number): string {
  return `${API_URL}/images/${imageId}/file`;
}

export const imagesService = {
  /** อัปโหลดรูป รับ Image กลับ (ใช้ id ผูกกับ Book) */
  async upload(file: File): Promise<Image> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<ApiResponse<Image> | Image>('/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(data);
  },

  /** รายการรูปทั้งหมด (admin) */
  async getAll(params?: PaginationParams & { search?: string }): Promise<PaginatedResponse<Image>> {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Image>> | PaginatedResponse<Image>>(
      '/images',
      {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
          search: params?.search,
        },
      },
    );
    return unwrap(data);
  },

  /** ดู metadata รูป */
  async getOne(id: number): Promise<Image> {
    const { data } = await api.get<ApiResponse<Image> | Image>(`/images/${id}`);
    return unwrap(data);
  },

  /** ลบรูป */
  async delete(id: number): Promise<void> {
    await api.delete(`/images/${id}`);
  },
};
