'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getCoverUrl } from '@/services/books.service';
import { useBooks, useBorrowBook } from '@/hooks/useBooks';
import { useAuth } from '@/hooks/useAuth';
import PublicHeader from '@/components/PublicHeader';
import LoginModal from '@/components/LoginModal';
import ConfirmBorrowModal from '@/components/ConfirmBorrowModal';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingBorrow, setPendingBorrow] = useState<{ id: number; title: string } | undefined>(undefined);
  const { user, token } = useAuth();
  const { data: booksRaw = [], isLoading, isFetching, error } = useBooks(searchQuery || undefined);
  const borrowMutation = useBorrowBook();

  const books = [...booksRaw].sort((a, b) => b.availableQuantity - a.availableQuantity);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchQuery(search);
  }

  function handleBorrowClick(e: React.MouseEvent, bookId: number, bookTitle: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      setPendingBorrow({ id: bookId, title: bookTitle });
      setLoginModalOpen(true);
      return;
    }
    setPendingBorrow({ id: bookId, title: bookTitle });
    setConfirmModalOpen(true);
  }

  async function handleConfirmBorrow() {
    if (!pendingBorrow) return;
    try {
      await borrowMutation.mutateAsync(pendingBorrow.id);
      setConfirmModalOpen(false);
      setPendingBorrow(undefined);
    } catch {
      // Error shown via hook onError
    }
  }

  function handleLoginSuccess() {
    setLoginModalOpen(false);
    if (pendingBorrow) {
      setConfirmModalOpen(true);
    } else {
      setPendingBorrow(undefined);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <PublicHeader />

      <main className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-slate-800" style={{ fontFamily: 'var(--font-prompt)' }}>
            ค้นหาหนังสือที่คุณชอบ
          </h1>
          <p className="text-slate-600">เลือกหนังสือที่ต้องการยืม อ่านได้ฟรี!</p>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2 rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-200/60">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อหนังสือ, ผู้แต่ง หรือ ISBN..."
              className="flex-1 rounded-lg border-0 bg-transparent px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0"
            />
            <button
              type="submit"
              disabled={isFetching}
              className="rounded-lg bg-amber-500 px-6 py-3 font-medium text-white hover:bg-amber-600 disabled:opacity-50 transition"
            >
              {isFetching ? 'กำลังค้นหา...' : 'ค้นหา'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-red-700">
            {error.message}
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white p-4 shadow-sm">
                <div className="mb-4 aspect-[2/3] rounded-xl bg-slate-200" />
                <div className="h-4 rounded bg-slate-200" />
                <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-16 text-center">
            <p className="text-xl text-slate-500">ไม่พบหนังสือ</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/50 transition hover:shadow-lg hover:ring-amber-200/60"
              >
                <div className="relative aspect-[2/3] overflow-hidden bg-slate-100">
                  <img
                    src={getCoverUrl(book)}
                    alt={book.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  {book.availableQuantity > 0 && (
                    <span className="absolute right-2 top-2 rounded-full bg-emerald-500/90 px-2 py-0.5 text-xs font-medium text-white">
                      พร้อมให้ยืม
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-semibold text-slate-800 line-clamp-2 group-hover:text-amber-700 transition">
                    {book.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">{book.author}</p>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                    <span className="text-xs text-slate-400">
                      {book.availableQuantity}/{book.totalQuantity} เล่ม
                    </span>
                    <button
                      onClick={(e) => handleBorrowClick(e, book.id, book.title)}
                      disabled={
                        (borrowMutation.isPending && borrowMutation.variables === book.id) ||
                        book.availableQuantity < 1
                      }
                      className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {borrowMutation.isPending && borrowMutation.variables === book.id
                        ? 'กำลังยืม...'
                        : book.availableQuantity < 1
                          ? 'หมดแล้ว'
                          : 'ยืมเลย'}
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-500">
          © Book Library — ระบบยืมหนังสือออนไลน์
          <span className="mx-2">|</span>
          {token && user?.isAdministration ? (
            <Link href="/admin/users" className="text-slate-400 hover:text-slate-600 transition">
              Admin Console
            </Link>
          ) : (
            <Link href="/login/admin" className="text-slate-400 hover:text-slate-600 transition">
              เข้าสู่ระบบ admin
            </Link>
          )}
        </div>
      </footer>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => {
          setLoginModalOpen(false);
          setPendingBorrow(undefined);
        }}
        onSuccess={handleLoginSuccess}
        message="กรุณาเข้าสู่ระบบเพื่อยืมหนังสือ"
      />

      <ConfirmBorrowModal
        isOpen={confirmModalOpen}
        bookTitle={pendingBorrow?.title ?? ''}
        onConfirm={handleConfirmBorrow}
        onCancel={() => {
          setConfirmModalOpen(false);
          setPendingBorrow(undefined);
        }}
        isLoading={borrowMutation.isPending}
      />
    </div>
  );
}
