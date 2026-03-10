'use client';

import Link from 'next/link';

interface BookFormLayoutProps {
  title: string;
  backHref: string;
  backLabel: string;
  children: React.ReactNode;
}

export default function BookFormLayout({
  title,
  backHref,
  backLabel,
  children,
}: BookFormLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#faf9f7]">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href={backHref}
          className="mb-6 inline-flex items-center gap-2 text-slate-600 hover:text-amber-600 transition"
        >
          <span>←</span>
          <span>{backLabel}</span>
        </Link>
        <h1
          className="mb-8 text-3xl font-bold text-slate-800"
          style={{ fontFamily: 'var(--font-prompt)' }}
        >
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}
