'use client';

import Link from 'next/link';
import { getCoverUrl } from '@/services/books.service';
import { useBorrowedBooks } from '@/hooks/useBooks';

export default function MyBorrowedBooksPage() {
  const { data: books = [], isLoading, error } = useBorrowedBooks();

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-slate-800" style={{ fontFamily: 'var(--font-prompt)' }}>
        รายการหนังสือที่ยืม
      </h1>
      <p className="mb-6 text-slate-600">รายการหนังสือที่คุณกำลังยืมอยู่</p>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-red-700">
          {error.message}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-4 aspect-[2/3] rounded-xl bg-slate-200" />
              <div className="h-4 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-16 text-center">
          <p className="text-xl text-slate-500">ยังไม่มีหนังสือที่ยืมอยู่</p>
          <Link href="/" className="mt-4 inline-block text-amber-600 hover:underline">
            ไปยืมหนังสือ
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="flex overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/50 transition hover:shadow-md"
            >
              <div className="h-40 w-28 shrink-0 bg-slate-100">
                <img
                  src={getCoverUrl(book)}
                  alt={book.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between p-4 min-w-0">
                <div>
                  <h3 className="font-semibold text-slate-800 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{book.author}</p>
                </div>
                <p className="text-xs text-slate-500">
                  ยืมเมื่อ: {formatDate(book.borrowedAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
