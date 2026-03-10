'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BooksPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/');
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-slate-600">กำลังโหลด...</div>
    </div>
  );
}
