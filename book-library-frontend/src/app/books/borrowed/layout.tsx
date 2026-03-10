import ProtectedLayout from '@/components/ProtectedLayout';

export default function BorrowedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
