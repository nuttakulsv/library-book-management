'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getCoverUrl } from '@/services/books.service';
import { useBooksPaginated, useDeleteBook } from '@/hooks/useBooks';
import Pagination from '@/components/Pagination';

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'วันที่เพิ่ม' },
  { value: 'title', label: 'ชื่อหนังสือ' },
  { value: 'author', label: 'ผู้แต่ง' },
  { value: 'availableQuantity', label: 'จำนวนคงเหลือ' },
];

export default function AdminBooksPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading, error } = useBooksPaginated({
    page,
    limit,
    search: searchQuery || undefined,
    sortBy,
    sortOrder,
  });
  const deleteMutation = useDeleteBook();

  const books = data?.data ?? [];
  const meta = data?.meta;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchQuery(search);
    setPage(1);
  }

  async function handleDelete(e: React.MouseEvent, id: number, title: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`ต้องการลบหนังสือ "${title}"?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // Error shown via hook onError
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-slate-800" style={{ fontFamily: 'var(--font-prompt)' }}>
            รายการหนังสือ
          </h1>
          <p className="text-slate-600">จัดการหนังสือทั้งหมดในระบบ (CRUD)</p>
        </div>
        <Link
          href="/books/new"
          className="inline-flex w-fit items-center justify-center rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 transition"
        >
          + เพิ่มหนังสือ
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อหนังสือ, ผู้แต่ง หรือ ISBN..."
            className="flex-1 min-w-[200px] rounded-lg border border-slate-300 px-4 py-2 text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition"
          >
            ค้นหา
          </button>
        </div>
      </form>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">เรียงตาม:</label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">ลำดับ:</label>
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as 'asc' | 'desc');
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="desc">มาก → น้อย</option>
            <option value="asc">น้อย → มาก</option>
          </select>
        </div>
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
            <div className="h-10 rounded bg-slate-100" />
          </div>
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-16 text-center">
          <p className="text-xl text-slate-500">ไม่พบหนังสือ</p>
          <Link href="/books/new" className="mt-4 inline-block text-amber-600 hover:underline">
            เพิ่มหนังสือเล่มแรก
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                    หนังสือ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                    ISBN
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                    ปีที่พิมพ์
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                    จำนวน
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-600">
                    การดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/books/${book.id}`}
                        className="flex items-center gap-3 hover:text-amber-600"
                      >
                        <div className="h-12 w-9 shrink-0 overflow-hidden rounded bg-slate-100">
                          <img
                            src={getCoverUrl(book)}
                            alt={book.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">
                            {book.title}
                          </div>
                          <div className="text-xs text-slate-500">
                            {book.author}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-slate-600">
                      {book.isbn}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {book.publicationYear}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      <span className={book.availableQuantity < 1 ? 'text-red-600' : ''}>
                        {book.availableQuantity}/{book.totalQuantity}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/books/${book.id}`}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                        >
                          ดู
                        </Link>
                        <Link
                          href={`/books/${book.id}/edit`}
                          className="rounded-lg bg-slate-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 transition"
                        >
                          แก้ไข
                        </Link>
                        <button
                          onClick={(e) => handleDelete(e, book.id, book.title)}
                          disabled={deleteMutation.isPending && deleteMutation.variables === book.id}
                          className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50 transition"
                        >
                          {deleteMutation.isPending && deleteMutation.variables === book.id
                            ? 'กำลังลบ...'
                            : 'ลบ'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
