'use client';

import { useEffect } from 'react';

interface ConfirmBorrowModalProps {
  isOpen: boolean;
  bookTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmBorrowModal({
  isOpen,
  bookTitle,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmBorrowModalProps) {
  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onCancel();
      };
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onCancel();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-2 text-lg font-semibold text-slate-800">ยืนยันการยืมหนังสือ</h3>
        <p className="mb-6 text-slate-600">
          คุณต้องการยืมหนังสือเล่มนี้หรือไม่?
          {bookTitle && (
            <span className="mt-2 block font-medium text-slate-800">"{bookTitle}"</span>
          )}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-slate-300 py-2.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-xl bg-amber-500 py-2.5 font-medium text-white hover:bg-amber-600 disabled:opacity-50"
          >
            {isLoading ? 'กำลังดำเนินการ...' : 'ยืนยัน'}
          </button>
        </div>
      </div>
    </div>
  );
}
