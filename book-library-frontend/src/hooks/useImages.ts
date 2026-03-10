'use client';

import { useQuery } from '@tanstack/react-query';
import { imagesService } from '@/services/images.service';
import type { ImagesQueryParams } from '@/lib/types';

export function useImages(params?: ImagesQueryParams) {
  return useQuery({
    queryKey: ['images', params?.page ?? 1, params?.limit ?? 50, params?.search ?? ''],
    queryFn: () => imagesService.getAll(params),
  });
}
