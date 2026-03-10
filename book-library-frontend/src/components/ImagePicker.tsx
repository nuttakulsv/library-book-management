'use client';

import { useState, useRef, useEffect } from 'react';
import { getImageFileUrl } from '@/services/images.service';
import { useImages } from '@/hooks/useImages';
import type { Image } from '@/lib/types';

interface ImagePickerProps {
  currentPreview?: string;
  currentImageId?: number;
  onSelectFile?: (file: File) => void;
  onSelectImageId?: (id: number) => void;
  onRemove?: () => void;
  disabled?: boolean;
}

export default function ImagePicker({
  currentPreview,
  currentImageId,
  onSelectFile,
  onSelectImageId,
  onRemove,
  disabled,
}: ImagePickerProps) {
  const [mode, setMode] = useState<'upload' | 'library'>('upload');
  const [selectedId, setSelectedId] = useState<number | undefined>(currentImageId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: imagesData, isLoading } = useImages({ limit: 30 });

  useEffect(() => {
    setSelectedId(currentImageId);
  }, [currentImageId]);

  const images = imagesData?.data ?? [];
  const displayUrl =
    currentPreview ??
    (selectedId || currentImageId
      ? getImageFileUrl(selectedId ?? currentImageId!)
      : '/book-placeholder.svg');

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onSelectFile?.(file);
      setSelectedId(undefined);
    }
  }

  function handleSelectImage(img: Image) {
    setSelectedId(img.id);
    onSelectImageId?.(img.id);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="shrink-0">
          <div className="aspect-[2/3] w-36 overflow-hidden rounded-xl bg-slate-100 shadow-md">
            <img
              src={displayUrl}
              alt="รูปปก"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                mode === 'upload'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              อัปโหลดรูปใหม่
            </button>
            <button
              type="button"
              onClick={() => setMode('library')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                mode === 'library'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              เลือกจากคลังรูป
            </button>
            {onRemove && (currentPreview || selectedId || currentImageId) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedId(undefined);
                  onRemove?.();
                }}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
              >
                ลบรูปปก
              </button>
            )}
          </div>

          {mode === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="rounded-lg border-2 border-dashed border-slate-300 px-6 py-3 text-sm text-slate-600 hover:border-amber-400 hover:bg-amber-50/50 transition disabled:opacity-50"
              >
                คลิกเพื่อเลือกไฟล์รูป (jpg, png, gif, webp)
              </button>
            </div>
          )}

          {mode === 'library' && (
            <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2">
              {isLoading ? (
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="aspect-square animate-pulse rounded bg-slate-200"
                    />
                  ))}
                </div>
              ) : images.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  ยังไม่มีรูปในคลัง กรุณาอัปโหลดที่หน้า คลังรูปภาพ
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => handleSelectImage(img)}
                      className={`aspect-square overflow-hidden rounded border-2 transition ${
                        (selectedId ?? currentImageId) === img.id
                          ? 'border-amber-500 ring-2 ring-amber-200'
                          : 'border-transparent hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={getImageFileUrl(img.id)}
                        alt={img.originalName ?? ''}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
