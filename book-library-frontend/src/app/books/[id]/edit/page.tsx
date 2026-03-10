'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBook, useUpdateBook } from '@/hooks/useBooks';
import { useAuth } from '@/hooks/useAuth';
import BookFormLayout from '@/components/BookFormLayout';
import ImagePicker from '@/components/ImagePicker';

export default function EditBookPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user && !user.isAdministration) {
      router.replace(`/books/${id}`);
    }
  }, [user, authLoading, router, id]);

  const { data: book, isLoading, error } = useBook(id);
  const updateMutation = useUpdateBook(id);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [publicationYear, setPublicationYear] = useState('');
  const [totalQuantity, setTotalQuantity] = useState('1');
  const [coverFile, setCoverFile] = useState<File | undefined>(undefined);
  const [coverImageId, setCoverImageId] = useState<number | undefined>(undefined);
  const [coverPreview, setCoverPreview] = useState<string | undefined>(undefined);
  const [removeCover, setRemoveCover] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setAuthor(book.author);
      setIsbn(book.isbn);
      setPublicationYear(String(book.publicationYear));
      setTotalQuantity(String(book.totalQuantity));
      setCoverImageId(book.coverImageId);
    }
  }, [book]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    try {
      await updateMutation.mutateAsync({
        data: {
          title,
          author,
          isbn,
          publicationYear: parseInt(publicationYear, 10),
          totalQuantity: parseInt(totalQuantity, 10) || 1,
          removeCover: removeCover || undefined,
        },
        coverFile: coverFile ?? undefined,
        coverImageId: removeCover ? undefined : coverImageId ?? undefined,
        removeCover: removeCover || undefined,
      });
      router.push(`/books/${id}`);
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to update');
    }
  }

  function handleSelectFile(file: File) {
    setCoverFile(file);
    setCoverImageId(undefined);
    setRemoveCover(false);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  }

  function handleSelectImageId(imgId: number) {
    setCoverImageId(imgId);
    setCoverFile(undefined);
    setRemoveCover(false);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(undefined);
  }

  function handleRemoveCover() {
    setRemoveCover(true);
    setCoverFile(undefined);
    setCoverImageId(undefined);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(undefined);
  }

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const displayPreview = coverFile ? coverPreview : undefined;
  const currentImageId = removeCover ? undefined : coverImageId ?? book?.coverImageId;

  if (authLoading || (user && !user.isAdministration)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f7]">
        <div className="text-slate-600">กำลังโหลด...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f7]">
        <div className="text-slate-600">กำลังโหลด...</div>
      </div>
    );
  }

  if (error && !book) {
    return (
      <BookFormLayout title="เกิดข้อผิดพลาด" backHref="/" backLabel="กลับไปรายการหนังสือ">
        <div className="rounded-xl bg-red-50 px-4 py-3 text-red-700">
          {error.message}
        </div>
      </BookFormLayout>
    );
  }

  if (!book) return null;

  return (
    <BookFormLayout
      title="แก้ไขหนังสือ"
      backHref={`/books/${id}`}
      backLabel="กลับไปรายละเอียดหนังสือ"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200/50"
        style={{ opacity: updateMutation.isPending ? 0.7 : 1 }}
      >
        {formError && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-red-700">
            {formError}
          </div>
        )}

        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            รูปปกหนังสือ
          </h2>
          <ImagePicker
            currentPreview={displayPreview}
            currentImageId={currentImageId}
            onSelectFile={handleSelectFile}
            onSelectImageId={handleSelectImageId}
            onRemove={handleRemoveCover}
            disabled={updateMutation.isPending}
          />
        </section>

        <section className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              ชื่อหนังสือ *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              ผู้แต่ง *
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              ISBN *
            </label>
            <input
              type="text"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              ปีที่พิมพ์ *
            </label>
            <input
              type="number"
              min="1900"
              max="2100"
              value={publicationYear}
              onChange={(e) => setPublicationYear(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              จำนวนเล่ม
            </label>
            <input
              type="number"
              min="1"
              value={totalQuantity}
              onChange={(e) => setTotalQuantity(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </section>

        <div className="flex flex-wrap gap-3 pt-4">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded-xl bg-amber-500 px-6 py-3 font-medium text-white hover:bg-amber-600 disabled:opacity-50 transition"
          >
            {updateMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/books/${id}`)}
            disabled={updateMutation.isPending}
            className="rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </BookFormLayout>
  );
}
