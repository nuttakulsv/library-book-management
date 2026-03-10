'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getCoverUrl } from '@/services/books.service';
import {
  useAllBorrowedPaginated,
  useBorrowedByUserId,
  useAdminReturnRecord,
} from '@/hooks/useBooks';
import { useSearchUsers } from '@/hooks/useUsers';
import Pagination from '@/components/Pagination';
import type { UserListItem } from '@/lib/types';

export default function AdminBorrowedPage() {
  const [listPage, setListPage] = useState(1);
  const [listLimit, setListLimit] = useState(20);
  const [listSearch, setListSearch] = useState('');
  const [listSearchQuery, setListSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserListItem | undefined>(undefined);

  const { data: listData, isPending: listLoading, error } = useAllBorrowedPaginated({
    page: listPage,
    limit: listLimit,
    search: listSearchQuery || undefined,
    sortBy: 'borrowedAt',
    sortOrder: 'desc',
  });
  const records = listData?.data ?? [];
  const listMeta = listData?.meta;
  const { data: users = [], isPending: usersLoading } = useSearchUsers(userSearchQuery);
  const { data: borrowed = [], isPending: borrowedLoading } = useBorrowedByUserId(
    selectedUser?.id ?? 0,
  );
  const returnMutation = useAdminReturnRecord();

  function handleListSearch(e: React.FormEvent) {
    e.preventDefault();
    setListSearchQuery(listSearch);
    setListPage(1);
  }

  async function handleReturn(e: React.MouseEvent, recordId: number) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await returnMutation.mutateAsync(recordId);
    } catch {
      // Error shown via hook onError
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <div>
      <h1
        className="mb-2 text-2xl font-bold text-slate-800"
        style={{ fontFamily: 'var(--font-prompt)' }}
      >
        รายการที่ถูกยืม & รับคืนหนังสือ
      </h1>
      <p className="mb-8 text-slate-600">
        จัดการรายการหนังสือที่ถูกยืม และรับคืนหนังสือจากสมาชิก
      </p>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-red-700">
          {error.message}
        </div>
      )}

      {/* ส่วนที่ 1: รายการที่ถูกยืม */}
      <section className="mb-12">
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="mb-2 font-semibold text-slate-800">
            📋 รายการที่ถูกยืม
          </h2>
          <p className="text-sm text-slate-600">
            แสดงรายการหนังสือที่กำลังถูกยืมอยู่ทั้งหมด พร้อมข้อมูลผู้ยืม สามารถค้นหาจากชื่อหนังสือ ผู้แต่ง ชื่อผู้ยืม หรือรหัสสมาชิกได้
          </p>
        </div>

        <form onSubmit={handleListSearch} className="mb-4">
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              placeholder="ค้นหาชื่อหนังสือ, ผู้แต่ง, ชื่อผู้ยืม หรือรหัสสมาชิก..."
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

        <div className="mb-4 flex items-center gap-4">
          <label className="text-sm text-slate-600">แสดง:</label>
          <select
            value={listLimit}
            onChange={(e) => {
              setListLimit(Number(e.target.value));
              setListPage(1);
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

        {listLoading ? (
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="animate-pulse space-y-4">
              <div className="h-10 rounded bg-slate-200" />
              <div className="h-10 rounded bg-slate-100" />
              <div className="h-10 rounded bg-slate-100" />
            </div>
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-16 text-center">
            <p className="text-xl text-slate-500">
              {listSearchQuery.trim() ? 'ไม่พบรายการที่ตรงกับคำค้นหา' : 'ยังไม่มีหนังสือที่ถูกยืมอยู่'}
            </p>
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
                      ผู้ยืม
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                      วันที่ยืม
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-600">
                      การดำเนินการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/books/${record.bookId}`}
                        className="flex items-center gap-3 hover:text-amber-600"
                      >
                        <div className="h-12 w-9 shrink-0 overflow-hidden rounded bg-slate-100">
                          <img
                            src={getCoverUrl(record.book)}
                            alt={record.book.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">
                            {record.book.title}
                          </div>
                          <div className="text-xs text-slate-500">
                            {record.book.author}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="text-sm font-medium text-slate-800">
                        {record.user.username}
                      </div>
                      {record.user.memberId && (
                        <div className="text-xs text-slate-500">
                          รหัส: {record.user.memberId}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {formatDate(record.borrowedAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        onClick={(e) => handleReturn(e, record.id)}
                        disabled={
                          returnMutation.isPending &&
                          returnMutation.variables === record.id
                        }
                        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 transition"
                      >
                        {returnMutation.isPending &&
                        returnMutation.variables === record.id
                          ? 'กำลังรับคืน...'
                          : 'รับคืนหนังสือ'}
                      </button>
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {listMeta && (
              <div className="mt-4">
                <Pagination meta={listMeta} onPageChange={setListPage} />
              </div>
            )}
          </>
        )}
      </section>

      {/* ส่วนที่ 2: รับคืนหนังสือตามผู้ใช้ */}
      <section>
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="mb-2 font-semibold text-slate-800">
            📥 รับคืนหนังสือตามผู้ใช้
          </h2>
          <p className="text-sm text-slate-600">
            วิธีรับคืนหนังสือ — พิมพ์ค้นหาชื่อผู้ใช้หรือรหัสสมาชิก จากนั้นเลือกชื่อผู้ใช้ที่ต้องการ แล้วเข้าไปดูรายการหนังสือที่ผู้นั้นกำลังยืมอยู่ สามารถกดปุ่ม รับคืนหนังสือ ในแต่ละรายการได้
          </p>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            ค้นหาชื่อผู้ใช้
          </label>
          <input
            type="text"
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
            placeholder="พิมพ์ชื่อผู้ใช้ หรือรหัสสมาชิก"
            className="w-full max-w-md rounded-lg border border-slate-300 px-4 py-2 text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {userSearchQuery.trim() && usersLoading ? (
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="animate-pulse space-y-2">
              <div className="h-10 rounded bg-slate-200" />
              <div className="h-10 rounded bg-slate-100" />
            </div>
          </div>
        ) : userSearchQuery.trim() && users.length > 0 ? (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedUser(u)}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-slate-50 ${
                    selectedUser?.id === u.id ? 'bg-amber-50' : ''
                  }`}
                >
                  <div>
                    <span className="font-medium text-slate-800">{u.username}</span>
                    {u.memberId && (
                      <span className="ml-2 text-sm text-slate-500">
                        ({u.memberId})
                      </span>
                    )}
                  </div>
                  {u.email && (
                    <span className="text-sm text-slate-500">{u.email}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : userSearchQuery.trim() && !usersLoading ? (
          <p className="mb-6 text-slate-500">ไม่พบผู้ใช้</p>
        ) : !userSearchQuery.trim() ? (
          <p className="mb-6 text-slate-500">
            พิมพ์ชื่อผู้ใช้ หรือรหัสสมาชิกเพื่อค้นหา
          </p>
        ) : null}

        {selectedUser && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">
              รายการที่ {selectedUser.username} กำลังยืมอยู่
            </h3>

            {borrowedLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-xl bg-slate-50 p-4"
                  >
                    <div className="mb-3 aspect-[2/3] rounded-lg bg-slate-200" />
                    <div className="h-4 rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : borrowed.length === 0 ? (
              <p className="text-slate-500">ไม่มีหนังสือที่กำลังยืมอยู่</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {borrowed.map((record) => (
                  <div
                    key={record.id}
                    className="flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="h-32 w-24 shrink-0 bg-slate-100">
                      <img
                        src={getCoverUrl(record.book)}
                        alt={record.book.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-3 min-w-0">
                      <div>
                        <h3 className="font-semibold text-slate-800 line-clamp-2 text-sm">
                          {record.book.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-600">
                          {record.book.author}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          ยืมเมื่อ: {formatDate(record.borrowedAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleReturn(e, record.id)}
                        disabled={
                          returnMutation.isPending &&
                          returnMutation.variables === record.id
                        }
                        className="mt-2 w-fit rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-50 transition"
                      >
                        {returnMutation.isPending &&
                        returnMutation.variables === record.id
                          ? 'กำลังรับคืน...'
                          : 'รับคืนหนังสือ'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
