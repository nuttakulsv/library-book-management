export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publicationYear: number;
  /** รูปปกจาก Master Images (ใช้ id อ้างอิง) */
  coverImageId?: number;
  /** Legacy: path รูปปกเก่า */
  coverImage?: string;
  totalQuantity: number;
  availableQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookInput {
  title: string;
  author: string;
  isbn: string;
  publicationYear: number;
  totalQuantity?: number;
  /** id ของรูปจาก Images API (เมื่ออัปโหลดแยกก่อน) */
  coverImageId?: number;
}

export interface UpdateBookInput extends Partial<CreateBookInput> {
  /** true = ลบรูปปกออก */
  removeCover?: boolean;
}

export interface BorrowedBook extends Book {
  borrowedAt: string;
}

/** Admin: รายการยืมของ user (ใช้ในหน้าเลือก user แล้วดูรายการ) */
export interface AdminBorrowRecord {
  id: number;
  bookId: number;
  book: Book;
  borrowedAt: string;
  userId: number;
}

/** Admin: รายการยืมทั้งหมด พร้อมข้อมูลผู้ยืม */
export interface AdminBorrowRecordWithUser extends AdminBorrowRecord {
  user: { id: number; username: string; memberId?: string };
}

/** ข้อมูลรูปปกหนังสือ สำหรับสร้าง URL (coverImageId หรือ coverImage) */
export interface BookCoverSource {
  coverImageId?: number;
  coverImage?: string;
}

/** Input สำหรับ mutation สร้างหนังสือ */
export interface CreateBookMutationInput {
  data: CreateBookInput;
  coverFile?: File;
  coverImageId?: number;
}

/** Input สำหรับ mutation แก้ไขหนังสือ */
export interface UpdateBookMutationInput {
  data: UpdateBookInput;
  coverFile?: File;
  coverImageId?: number;
  removeCover?: boolean;
}
