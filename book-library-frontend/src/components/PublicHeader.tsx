'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function PublicHeader() {
  const { user, token, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-amber-100/50 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <span className="font-bold text-xl text-slate-800" style={{ fontFamily: 'var(--font-prompt)' }}>
            Book Library
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {token && (
            <Link
              href="/books/borrowed"
              className="text-sm font-medium text-slate-600 hover:text-amber-600 transition"
            >
              รายการหนังสือที่ยืม
            </Link>
          )}
          {token && user?.isAdministration && (
            <Link
              href="/admin/books"
              className="text-sm font-medium text-amber-600 hover:text-amber-700 transition"
            >
              Admin Console
            </Link>
          )}
          {token ? (
            <>
              <span className="text-sm text-slate-500">
                {user?.username} {user?.memberId && `#${user.memberId}`}
              </span>
              <button
                onClick={() => logout()}
                className="text-sm font-medium text-slate-500 hover:text-red-600 transition"
              >
                ออกจากระบบ
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg border border-amber-500 px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 transition"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition"
              >
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
