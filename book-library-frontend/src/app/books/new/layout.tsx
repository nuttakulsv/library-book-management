import AdminLayout from '@/components/AdminLayout';

export default function NewBookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
