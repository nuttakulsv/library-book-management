const PENDING_BORROW_KEY = 'pendingBorrowBookId';

export function getPendingBorrowBookId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return sessionStorage.getItem(PENDING_BORROW_KEY) ?? undefined;
}

export function setPendingBorrowBookId(bookId: number): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(PENDING_BORROW_KEY, String(bookId));
}

export function clearPendingBorrowBookId(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(PENDING_BORROW_KEY);
}
