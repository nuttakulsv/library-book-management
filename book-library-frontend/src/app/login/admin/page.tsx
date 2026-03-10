'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, token, user, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && token && user?.isAdministration) {
      router.replace('/admin/books');
    }
  }, [token, user, isLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      router.push('/admin/books');
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ';
      setError(msg);
      showToast(msg, 'error');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200/50">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-3xl">📚</span>
              <span className="font-bold text-xl text-slate-800" style={{ fontFamily: 'var(--font-prompt)' }}>
                Book Library
              </span>
            </Link>
            <h1 className="mt-6 text-xl font-semibold text-slate-800">
              เข้าสู่ระบบแอดมิน
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              จัดการหนังสือและสมาชิก
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
                placeholder="ชื่อผู้ใช้แอดมิน"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
                placeholder="รหัสผ่าน"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-slate-700 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-50 transition"
            >
              {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบแอดมิน'}
            </button>
          </form>
          <p className="mt-6 text-center">
            <Link href="/login" className="text-sm text-slate-500 hover:text-slate-700">
              ← กลับไปหน้าสมาชิก
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
