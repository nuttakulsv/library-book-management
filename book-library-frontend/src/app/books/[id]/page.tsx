'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCoverUrl } from '@/services/books.service';
import {
  useBook,
  useBorrowBook,
  useReturnBook,
  useDeleteBook,
} from '@/hooks/useBooks';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/types';
import LoginModal from '@/components/LoginModal';
import ConfirmBorrowModal from '@/components/ConfirmBorrowModal';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const { user, token } = useAuth();
  const { data: book, isLoading, error } = useBook(id);
  const borrowMutation = useBorrowBook();
  const returnMutation = useReturnBook();
  const deleteMutation = useDeleteBook();

  const actionLoading =
    borrowMutation.isPending || returnMutation.isPending || deleteMutation.isPending;

  function handleBorrow() {
    if (!token) {
      setLoginModalOpen(true);
      return;
    }
    setConfirmModalOpen(true);
  }

  async function handleConfirmBorrow() {
    try {
      await borrowMutation.mutateAsync(id);
      setConfirmModalOpen(false);
    } catch {
      // Error shown via mutation
    }
  }

  function handleLoginSuccess() {
    setLoginModalOpen(false);
    setConfirmModalOpen(true);
  }

  async function handleReturn() {
    try {
      await returnMutation.mutateAsync(id);
    } catch {
      // Error shown via hook onError
    }
  }

  async function handleDelete() {
    if (!confirm('ต้องการลบหนังสือเล่มนี้?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      router.push('/');
      router.refresh();
    } catch {
      // Error via mutation
    }
  }

  const mutationError =
    borrowMutation.error || returnMutation.error || deleteMutation.error;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f7]">
        <div className="text-slate-600">กำลังโหลด...</div>
      </div>
    );
  }

  if (error && !book) {
    return (
      <div className="min-h-screen bg-[#faf9f7] px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-red-700">
            {error.message}
          </div>
          <Link href="/" className="text-amber-600 hover:underline">
            ← กลับไปรายการหนังสือ
          </Link>
        </div>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="min-h-screen w-full bg-[#faf9f7]">
      <header className="sticky top-0 z-10 border-b border-amber-100/50 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="font-bold text-xl text-slate-800" style={{ fontFamily: 'var(--font-prompt)' }}>
              Book Library
            </span>
          </Link>
          <Link href="/" className="text-sm text-slate-600 hover:text-amber-600 transition">
            ← กลับ
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        {mutationError ? (
          <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-red-700">
            {getErrorMessage(mutationError)}
          </div>
        ) : null}

        <div className="flex flex-col gap-10 rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200/50 lg:flex-row lg:gap-12">
          <div className="shrink-0">
            <div className="aspect-[2/3] w-full max-w-[280px] overflow-hidden rounded-2xl bg-slate-100 shadow-xl ring-1 ring-slate-200/50">
              <img
                src={getCoverUrl(book)}
                alt={book.title}
                className="h-full w-full object-cover"
              />
            </div>
            {book.availableQuantity > 0 && (
              <span className="mt-3 inline-block rounded-full bg-emerald-500/90 px-4 py-2 text-sm font-medium text-white shadow">
                พร้อมให้ยืม {book.availableQuantity} เล่ม
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-slate-800 leading-tight" style={{ fontFamily: 'var(--font-prompt)' }}>
              {book.title}
            </h1>
            <p className="mt-3 text-lg text-slate-600">ผู้แต่ง: {book.author}</p>
            <p className="mt-1 text-sm text-slate-500">ISBN: {book.isbn}</p>
            <p className="mt-1 text-sm text-slate-500">ปีที่พิมพ์: {book.publicationYear}</p>
            <p className="mt-6 text-xl font-medium text-slate-700">
              {book.availableQuantity} / {book.totalQuantity} เล่ม พร้อมให้ยืม
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {token && user?.isAdministration && (
                <>
                  <Link
                    href={`/books/${id}/edit`}
                    className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition"
                  >
                    แก้ไข
                  </Link>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 transition"
              >
                {deleteMutation.isPending ? 'กำลังลบ...' : 'ลบ'}
              </button>
                </>
              )}
              <button
                onClick={handleBorrow}
                disabled={actionLoading || book.availableQuantity < 1}
                className="rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {book.availableQuantity < 1
                  ? 'หมดแล้ว'
                  : borrowMutation.isPending
                    ? 'กำลังยืม...'
                    : token
                      ? 'ยืมหนังสือ'
                      : 'เข้าสู่ระบบเพื่อยืม'}
              </button>
              {token && user?.isAdministration && (
                <button
                  onClick={handleReturn}
                  disabled={
                    actionLoading ||
                    book.availableQuantity >= book.totalQuantity
                  }
                  className="rounded-lg border border-amber-500 px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 disabled:opacity-50 transition"
                >
                  {returnMutation.isPending ? 'กำลังคืน...' : 'คืนหนังสือ'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
        message={`กรุณาเข้าสู่ระบบเพื่อยืมหนังสือ "${book?.title ?? ''}"`}
      />

      <ConfirmBorrowModal
        isOpen={confirmModalOpen}
        bookTitle={book?.title ?? ''}
        onConfirm={handleConfirmBorrow}
        onCancel={() => setConfirmModalOpen(false)}
        isLoading={borrowMutation.isPending}
      />
    </div>
  );
}
