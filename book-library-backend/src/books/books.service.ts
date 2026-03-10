import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import type { SortOrder } from '../common/types/pagination.types';
import {
  PaginatedResponse,
  createPaginationMeta,
} from '../common/types/pagination.types';
import { BorrowRecord } from '../entities/borrow-record.entity';
import { Book } from '../entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(BorrowRecord)
    private readonly borrowRecordRepository: Repository<BorrowRecord>,
  ) {}

  async create(dto: CreateBookDto, coverImageId?: number): Promise<Book> {
    const existing = await this.bookRepository.findOne({
      where: { isbn: dto.isbn },
    });
    if (existing) {
      throw new BadRequestException('Book with this ISBN already exists');
    }
    const book = this.bookRepository.create({
      ...dto,
      coverImageId: coverImageId ?? dto.coverImageId,
      coverImage: dto.coverImage,
      totalQuantity: dto.totalQuantity ?? 1,
      availableQuantity: dto.totalQuantity ?? 1,
    });
    return this.bookRepository.save(book);
  }

  async findAll(search?: string): Promise<Book[]> {
    const qb = this.bookRepository.createQueryBuilder('book');
    if (search?.trim()) {
      const q = `%${search.trim()}%`;
      qb.where(
        'book.title ILIKE :q OR book.author ILIKE :q OR book.isbn ILIKE :q',
        { q },
      );
    }
    return qb.orderBy('book.created_at', 'DESC').getMany();
  }

  async findAllPaginated(
    search?: string,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder: SortOrder = 'desc',
  ): Promise<PaginatedResponse<Book>> {
    const qb = this.bookRepository.createQueryBuilder('book');
    if (search?.trim()) {
      const q = `%${search.trim()}%`;
      qb.where(
        'book.title ILIKE :q OR book.author ILIKE :q OR book.isbn ILIKE :q',
        { q },
      );
    }
    const allowedSort: Record<string, string> = {
      title: 'book.title',
      author: 'book.author',
      isbn: 'book.isbn',
      publicationYear: 'book.publication_year',
      createdAt: 'book.created_at',
      availableQuantity: 'book.available_quantity',
      totalQuantity: 'book.total_quantity',
    };
    const orderBy = allowedSort[sortBy] || 'book.created_at';
    qb.orderBy(orderBy, sortOrder === 'asc' ? 'ASC' : 'DESC');

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: createPaginationMeta(total, page, limit),
    };
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }
    return book;
  }

  async update(id: number, dto: UpdateBookDto, coverImageId?: number): Promise<Book> {
    const book = await this.findOne(id);
    if (dto.isbn && dto.isbn !== book.isbn) {
      const existing = await this.bookRepository.findOne({
        where: { isbn: dto.isbn },
      });
      if (existing) {
        throw new BadRequestException('Book with this ISBN already exists');
      }
    }
    Object.assign(book, dto);
    if (dto.removeCover) {
      book.coverImageId = undefined;
      book.coverImage = undefined;
    } else if (coverImageId !== undefined) {
      book.coverImageId = coverImageId;
    }
    if (dto.totalQuantity !== undefined) {
      const diff = dto.totalQuantity - book.totalQuantity;
      book.totalQuantity = dto.totalQuantity;
      book.availableQuantity = Math.max(0, book.availableQuantity + diff);
    }
    return this.bookRepository.save(book);
  }

  async remove(id: number): Promise<void> {
    const book = await this.findOne(id);
    await this.bookRepository.remove(book);
  }

  async borrow(id: number, userId: number): Promise<Book> {
    const book = await this.findOne(id);
    if (book.availableQuantity < 1) {
      throw new BadRequestException('No copies available to borrow');
    }
    const record = this.borrowRecordRepository.create({
      userId,
      bookId: id,
      borrowedAt: new Date(),
    });
    await this.borrowRecordRepository.save(record);
    book.availableQuantity -= 1;
    return this.bookRepository.save(book);
  }

  async returnBook(id: number, userId: number): Promise<Book> {
    const book = await this.findOne(id);
    const record = await this.borrowRecordRepository.findOne({
      where: { userId, bookId: id, returnedAt: IsNull() },
    });
    if (!record) {
      throw new BadRequestException('You have not borrowed this book');
    }
    if (book.availableQuantity >= book.totalQuantity) {
      throw new BadRequestException('All copies are already returned');
    }
    record.returnedAt = new Date();
    await this.borrowRecordRepository.save(record);
    book.availableQuantity += 1;
    return this.bookRepository.save(book);
  }

  async findBorrowedByUser(userId: number): Promise<Array<Book & { borrowedAt: string }>> {
    const records = await this.borrowRecordRepository.find({
      where: { userId, returnedAt: IsNull() },
      relations: ['book'],
      order: { borrowedAt: 'DESC' },
    });
    return records.map((r) => ({
      ...r.book,
      borrowedAt: r.borrowedAt.toISOString(),
    }));
  }

  /** Admin: คืนหนังสือตาม record id */
  async returnBorrowRecord(recordId: number): Promise<BorrowRecord> {
    const record = await this.borrowRecordRepository.findOne({
      where: { id: recordId, returnedAt: IsNull() },
      relations: ['book'],
    });
    if (!record) {
      throw new NotFoundException('ไม่พบรายการยืมที่ยังไม่คืน');
    }
    record.returnedAt = new Date();
    await this.borrowRecordRepository.save(record);
    const book = record.book;
    book.availableQuantity += 1;
    await this.bookRepository.save(book);
    return record;
  }

  /** Admin: รายการที่ยืมของ user คนใดคนหนึ่ง */
  async findBorrowedByUserId(userId: number): Promise<
    Array<{
      id: number;
      bookId: number;
      book: Book;
      borrowedAt: string;
      userId: number;
    }>
  > {
    const records = await this.borrowRecordRepository.find({
      where: { userId, returnedAt: IsNull() },
      relations: ['book'],
      order: { borrowedAt: 'DESC' },
    });
    return records.map((r) => ({
      id: r.id,
      bookId: r.bookId,
      book: r.book,
      borrowedAt: r.borrowedAt.toISOString(),
      userId: r.userId,
    }));
  }

  /** Admin: รายการยืมทั้งหมดที่ยังไม่คืน (ไม่ใช้ pagination) */
  async findAllBorrowed(): Promise<
    Array<{
      id: number;
      bookId: number;
      book: Book;
      userId: number;
      user: { id: number; username: string; memberId?: string };
      borrowedAt: string;
    }>
  > {
    const result = await this.findAllBorrowedPaginated(undefined, 1, 1000);
    return result.data;
  }

  /** Admin: รายการยืมทั้งหมด (พร้อม pagination, search) */
  async findAllBorrowedPaginated(
    search?: string,
    page = 1,
    limit = 20,
    sortBy = 'borrowedAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<
    PaginatedResponse<{
      id: number;
      bookId: number;
      book: Book;
      userId: number;
      user: { id: number; username: string; memberId?: string };
      borrowedAt: string;
    }>
  > {
    const qb = this.borrowRecordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.book', 'book')
      .leftJoinAndSelect('record.user', 'user')
      .where('record.returned_at IS NULL');

    if (search?.trim()) {
      const q = `%${search.trim()}%`;
      qb.andWhere(
        '(book.title ILIKE :q OR book.author ILIKE :q OR user.username ILIKE :q OR user.member_id ILIKE :q)',
        { q },
      );
    }

    const allowedSort: Record<string, string> = {
      borrowedAt: 'record.borrowedAt',
      id: 'record.id',
    };
    const orderBy = allowedSort[sortBy] || 'record.borrowedAt';
    qb.orderBy(orderBy, sortOrder === 'asc' ? 'ASC' : 'DESC');

    const [records, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const data = records.map((r) => ({
      id: r.id,
      bookId: r.bookId,
      book: r.book,
      userId: r.userId,
      user: {
        id: r.user.id,
        username: r.user.username,
        memberId: r.user.memberId,
      },
      borrowedAt: r.borrowedAt.toISOString(),
    }));

    return {
      data,
      meta: createPaginationMeta(total, page, limit),
    };
  }
}
