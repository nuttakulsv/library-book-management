'use client';

import { useState, useRef } from 'react';
import { imagesService, getImageFileUrl } from '@/services/images.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Image } from '@/lib/types';
import Pagination from '@/components/Pagination';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/lib/types';

export default function AdminImagesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-images', page, limit, searchQuery],
    queryFn: () =>
      imagesService.getAll({ page, limit, search: searchQuery || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => imagesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-images'] });
      showToast('ลบรูปสำเร็จ', 'success');
    },
    onError: (err) => {
      showToast(getErrorMessage(err), 'error');
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => imagesService.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-images'] });
      showToast('อัปโหลดรูปสำเร็จ', 'success');
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: (err) => {
      showToast(getErrorMessage(err), 'error');
    },
  });

  const images = data?.data ?? [];
  const meta = data?.meta;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchQuery(search);
    setPage(1);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
    if (!allowed.test(file.name)) {
      showToast('รองรับเฉพาะไฟล์รูปภาพ (jpg, png, gif, webp)', 'error');
      return;
    }
    uploadMutation.mutate(file);
  }

  async function handleDelete(e: React.MouseEvent, id: number) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('ต้องการลบรูปนี้?')) return;
    deleteMutation.mutate(id);
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="mb-1 text-2xl font-bold text-slate-800"
            style={{ fontFamily: 'var(--font-prompt)' }}
          >
            คลังรูปภาพ (Master Images)
          </h1>
          <p className="text-slate-600">
            จัดการรูปภาพในระบบ ใช้ id อ้างอิงกับหนังสือ (coverImageId)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="inline-flex w-fit items-center justify-center rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 transition disabled:opacity-50"
          >
            {uploadMutation.isPending ? 'กำลังอัปโหลด...' : '+ อัปโหลดรูป'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อไฟล์..."
            className="min-w-[200px] flex-1 rounded-lg border border-slate-300 px-4 py-2 text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition"
          >
            ค้นหา
          </button>
        </div>
      </form>

      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">แสดง:</label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-slate-600">รายการ/หน้า</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-red-700">
          {error.message}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-10 rounded bg-slate-200" />
            <div className="h-10 rounded bg-slate-100" />
            <div className="h-10 rounded bg-slate-100" />
          </div>
        </div>
      ) : images.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-16 text-center">
          <p className="text-xl text-slate-500">ไม่พบรูปภาพ</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 inline-block text-amber-600 hover:underline"
          >
            อัปโหลดรูปแรก
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {images.map((img: Image) => (
              <div
                key={img.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="aspect-square bg-slate-100">
                  <img
                    src={getImageFileUrl(img.id)}
                    alt={img.originalName ?? img.fileName}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <div className="truncate text-xs font-mono text-slate-600">
                    ID: {img.id}
                  </div>
                  <div className="truncate text-sm text-slate-800">
                    {img.originalName ?? img.fileName}
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {(img.fileSize / 1024).toFixed(1)} KB
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, img.id)}
                      disabled={
                        deleteMutation.isPending &&
                        deleteMutation.variables === img.id
                      }
                      className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600 disabled:opacity-50"
                    >
                      {deleteMutation.isPending &&
                      deleteMutation.variables === img.id
                        ? 'ลบ...'
                        : 'ลบ'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {meta && (
            <div className="mt-4">
              <Pagination meta={meta} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
