'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register, token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && token) router.replace('/');
  }, [token, isLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 4) {
      setError('รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร');
      return;
    }
    try {
      await register(username, password);
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'สมัครสมาชิกไม่สำเร็จ');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center px-4">
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
              สมัครสมาชิก
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              ยืมหนังสือได้ฟรีเมื่อสมัครสมาชิก
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
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                placeholder="ชื่อผู้ใช้ (อย่างน้อย 4 ตัวอักษร)"
                required
                minLength={4}
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
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                placeholder="รหัสผ่าน (อย่างน้อย 4 ตัวอักษร)"
                required
                minLength={4}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-amber-500 py-3 font-medium text-white hover:bg-amber-600 disabled:opacity-50 transition"
            >
              {isLoading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            มีบัญชีแล้ว?{' '}
            <Link href="/login" className="font-medium text-amber-600 hover:text-amber-700">
              เข้าสู่ระบบ
            </Link>
          </p>
          <p className="mt-2 text-center">
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
              ← กลับไปหน้าหลัก
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
