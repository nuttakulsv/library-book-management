'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const ADMIN_NAV = [
  { href: '/admin/users', label: 'จัดการสมาชิก' },
  { href: '/admin/books', label: 'รายการหนังสือ' },
  { href: '/admin/borrowed', label: 'รายการที่ถูกยืม & รับคืน' },
  { href: '/books/new', label: 'เพิ่มหนังสือ' },
];

export default function AdminHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLink = (href: string, label: string) => {
    const isActive = pathname === href || pathname?.startsWith(href + '/');
    return (
      <Link
        href={href}
        onClick={() => setMobileMenuOpen(false)}
        className={`block text-sm font-medium transition ${
          isActive ? 'text-white' : 'text-slate-300 hover:text-white'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-800 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/admin/books" className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-prompt)' }}>
              Admin Console
            </span>
          </Link>
          <nav className="hidden items-center gap-6 sm:flex">
            {ADMIN_NAV.map(({ href, label }) => navLink(href, label))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="hidden text-sm text-slate-300 hover:text-white transition sm:inline"
          >
            ← กลับหน้าหลัก
          </Link>
          {user && (
            <span className="hidden text-sm text-slate-400 sm:inline">
              {user.username}
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="rounded-lg p-2 text-slate-300 hover:bg-slate-700 sm:hidden"
            aria-label="เมนู"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
          <button
            onClick={() => logout()}
            className="rounded-lg bg-slate-600 px-3 py-1.5 text-sm font-medium hover:bg-slate-500 transition"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="border-t border-slate-700 bg-slate-800 px-4 py-3 sm:hidden">
          <nav className="flex flex-col gap-2">
            {ADMIN_NAV.map(({ href, label }) => navLink(href, label))}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-slate-300 hover:text-white"
            >
              ← กลับหน้าหลัก
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
