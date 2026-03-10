import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BorrowRecord } from '../entities/borrow-record.entity';
import { Book } from '../entities/book.entity';
import { User } from '../entities/user.entity';
import { BooksService } from './books.service';

/** สร้าง mock query builder ที่รองรับ getMany และ getManyAndCount */
function createQueryBuilderMock(getManyResult: unknown[] = [], getManyAndCountResult?: [unknown[], number]) {
  const chain = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(getManyResult),
    getManyAndCount: jest.fn().mockResolvedValue(getManyAndCountResult ?? [getManyResult, getManyResult.length]),
  };
  return jest.fn(() => chain);
}

describe('BooksService', () => {
  let service: BooksService;
  let bookRepository: jest.Mocked<Repository<Book>>;
  let borrowRecordRepository: jest.Mocked<Repository<BorrowRecord>>;

  const mockBook: Partial<Book> = {
    id: 1,
    title: 'Test Book',
    author: 'Test Author',
    isbn: '978-0-13-235088-4',
    publicationYear: 2020,
    coverImage: null,
    totalQuantity: 2,
    availableQuantity: 2,
  };

  const mockUser: Partial<User> = {
    id: 1,
    username: 'testuser',
    memberId: 'M001',
  };

  beforeEach(async () => {
    const mockBookRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: createQueryBuilderMock([mockBook], [[mockBook], 1]),
    };
    const mockBorrowRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: createQueryBuilderMock(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: getRepositoryToken(Book), useValue: mockBookRepo },
        { provide: getRepositoryToken(BorrowRecord), useValue: mockBorrowRepo },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    bookRepository = module.get(getRepositoryToken(Book));
    borrowRecordRepository = module.get(getRepositoryToken(BorrowRecord));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new book', async () => {
      (bookRepository.findOne as jest.Mock).mockResolvedValue(null);
      (bookRepository.create as jest.Mock).mockReturnValue(mockBook);
      (bookRepository.save as jest.Mock).mockResolvedValue(mockBook);

      const dto = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '978-0-13-235088-4',
        publicationYear: 2020,
      };

      const result = await service.create(dto);
      expect(result).toEqual(mockBook);
      expect(bookRepository.findOne).toHaveBeenCalledWith({
        where: { isbn: dto.isbn },
      });
      expect(bookRepository.create).toHaveBeenCalled();
      expect(bookRepository.save).toHaveBeenCalled();
    });

    it('should create book with coverImageId when provided', async () => {
      (bookRepository.findOne as jest.Mock).mockResolvedValue(null);
      (bookRepository.create as jest.Mock).mockReturnValue({ ...mockBook, coverImageId: 5 });
      (bookRepository.save as jest.Mock).mockResolvedValue({ ...mockBook, coverImageId: 5 });

      const dto = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '978-0-13-235088-4',
        publicationYear: 2020,
      };
      const result = await service.create(dto, 5);
      expect(result.coverImageId).toBe(5);
      expect(bookRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ coverImageId: 5 }),
      );
    });

    it('should throw BadRequestException when ISBN exists', async () => {
      (bookRepository.findOne as jest.Mock).mockResolvedValue(mockBook);

      await expect(
        service.create({
          title: 'Test',
          author: 'Author',
          isbn: '978-0-13-235088-4',
          publicationYear: 2020,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all books when no search', async () => {
      (bookRepository.createQueryBuilder as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockBook]),
      });

      const result = await service.findAll();
      expect(result).toEqual([mockBook]);
    });

    it('should filter by search when provided', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockBook]),
      };
      (bookRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      await service.findAll('test');
      expect(qb.where).toHaveBeenCalledWith(
        'book.title ILIKE :q OR book.author ILIKE :q OR book.isbn ILIKE :q',
        { q: '%test%' },
      );
    });
  });

  describe('findAllPaginated', () => {
    it('should return paginated books with meta', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockBook], 1]),
      };
      (bookRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      const result = await service.findAllPaginated(undefined, 1, 20);
      expect(result.data).toEqual([mockBook]);
      expect(result.meta).toMatchObject({
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      expect(qb.skip).toHaveBeenCalledWith(0);
      expect(qb.take).toHaveBeenCalledWith(20);
    });
  });

  describe('findOne', () => {
    it('should return book by id', async () => {
      (bookRepository.findOne as jest.Mock).mockResolvedValue(mockBook);

      const result = await service.findOne(1);
      expect(result).toEqual(mockBook);
      expect(bookRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when book not found', async () => {
      (bookRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update book successfully', async () => {
      const updatedBook = { ...mockBook, title: 'Updated Title' };
      (bookRepository.findOne as jest.Mock).mockResolvedValue(mockBook);
      (bookRepository.save as jest.Mock).mockResolvedValue(updatedBook);

      const result = await service.update(1, { title: 'Updated Title' });
      expect(result.title).toBe('Updated Title');
      expect(bookRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when new ISBN exists', async () => {
      const existingBook = { ...mockBook, isbn: '111' };
      (bookRepository.findOne as jest.Mock)
        .mockResolvedValueOnce(mockBook)
        .mockResolvedValueOnce(existingBook);

      await expect(
        service.update(1, { isbn: '111' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should remove cover when removeCover is true', async () => {
      const bookWithCover = { ...mockBook, coverImageId: 5, coverImage: 'x' };
      (bookRepository.findOne as jest.Mock).mockResolvedValue(bookWithCover);
      (bookRepository.save as jest.Mock).mockResolvedValue({
        ...bookWithCover,
        coverImageId: undefined,
        coverImage: undefined,
      });

      await service.update(1, { removeCover: true });
      expect(bookRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          coverImageId: undefined,
          coverImage: undefined,
        }),
      );
    });
  });

  describe('remove', () => {
    it('should remove book by id', async () => {
      (bookRepository.findOne as jest.Mock).mockResolvedValue(mockBook);
      (bookRepository.remove as jest.Mock).mockResolvedValue(mockBook);

      await service.remove(1);
      expect(bookRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(bookRepository.remove).toHaveBeenCalledWith(mockBook);
    });

    it('should throw NotFoundException when book not found', async () => {
      (bookRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('borrow', () => {
    it('should decrease available quantity and create borrow record', async () => {
      const bookToBorrow = { ...mockBook, availableQuantity: 2 };
      (bookRepository.findOne as jest.Mock).mockResolvedValue(bookToBorrow);
      (bookRepository.save as jest.Mock).mockResolvedValue({
        ...bookToBorrow,
        availableQuantity: 1,
      });
      (borrowRecordRepository.create as jest.Mock).mockReturnValue({});
      (borrowRecordRepository.save as jest.Mock).mockResolvedValue({});

      const result = await service.borrow(1, 1);
      expect(result.availableQuantity).toBe(1);
      expect(borrowRecordRepository.create).toHaveBeenCalled();
      expect(borrowRecordRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when no copies available', async () => {
      (bookRepository.findOne as jest.Mock).mockResolvedValue({
        ...mockBook,
        availableQuantity: 0,
      });

      await expect(service.borrow(1, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('returnBook', () => {
    it('should increase available quantity when user has borrowed', async () => {
      const borrowedBook = { ...mockBook, availableQuantity: 1, totalQuantity: 2 };
      const mockRecord = { userId: 1, bookId: 1, returnedAt: null };
      (bookRepository.findOne as jest.Mock).mockResolvedValue(borrowedBook);
      (borrowRecordRepository.findOne as jest.Mock).mockResolvedValue(mockRecord);
      (borrowRecordRepository.save as jest.Mock).mockResolvedValue({});
      (bookRepository.save as jest.Mock).mockResolvedValue({
        ...borrowedBook,
        availableQuantity: 2,
      });

      const result = await service.returnBook(1, 1);
      expect(result.availableQuantity).toBe(2);
    });

    it('should throw BadRequestException when user has not borrowed', async () => {
      (bookRepository.findOne as jest.Mock).mockResolvedValue(mockBook);
      (borrowRecordRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.returnBook(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when all copies returned', async () => {
      (bookRepository.findOne as jest.Mock).mockResolvedValue({
        ...mockBook,
        availableQuantity: 2,
        totalQuantity: 2,
      });
      (borrowRecordRepository.findOne as jest.Mock).mockResolvedValue({});

      await expect(service.returnBook(1, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findBorrowedByUser', () => {
    it('should return books borrowed by user', async () => {
      const mockRecord = {
        book: mockBook,
        borrowedAt: new Date('2024-01-15'),
      };
      (borrowRecordRepository.find as jest.Mock).mockResolvedValue([mockRecord]);

      const result = await service.findBorrowedByUser(1);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        ...mockBook,
        borrowedAt: '2024-01-15T00:00:00.000Z',
      });
      expect(borrowRecordRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 1 }),
          relations: ['book'],
          order: { borrowedAt: 'DESC' },
        }),
      );
    });
  });

  describe('returnBorrowRecord', () => {
    it('should return book by record id and increase available quantity', async () => {
      const mockRecord = {
        id: 10,
        userId: 1,
        bookId: 1,
        book: { ...mockBook, availableQuantity: 1 },
        borrowedAt: new Date(),
        returnedAt: null,
      };
      (borrowRecordRepository.findOne as jest.Mock).mockResolvedValue(mockRecord);
      (borrowRecordRepository.save as jest.Mock).mockResolvedValue(mockRecord);
      (bookRepository.save as jest.Mock).mockResolvedValue({
        ...mockRecord.book,
        availableQuantity: 2,
      });

      const result = await service.returnBorrowRecord(10);
      expect(result).toEqual(mockRecord);
      expect(bookRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when record not found', async () => {
      (borrowRecordRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.returnBorrowRecord(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBorrowedByUserId', () => {
    it('should return borrow records for user', async () => {
      const mockRecord = {
        id: 1,
        bookId: 1,
        book: mockBook,
        userId: 1,
        borrowedAt: new Date('2024-01-15'),
      };
      (borrowRecordRepository.find as jest.Mock).mockResolvedValue([mockRecord]);

      const result = await service.findBorrowedByUserId(1);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 1,
        bookId: 1,
        userId: 1,
        borrowedAt: '2024-01-15T00:00:00.000Z',
      });
    });
  });

  describe('findAllBorrowed', () => {
    it('should return all borrowed records', async () => {
      const mockRecord = {
        id: 1,
        bookId: 1,
        book: mockBook,
        userId: 1,
        user: mockUser,
        borrowedAt: new Date('2024-01-15'),
      };
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockRecord], 1]),
      };
      (borrowRecordRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      const result = await service.findAllBorrowed();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 1,
        bookId: 1,
        userId: 1,
        borrowedAt: '2024-01-15T00:00:00.000Z',
      });
    });
  });

  describe('findAllBorrowedPaginated', () => {
    it('should return paginated borrowed records', async () => {
      const mockRecord = {
        id: 1,
        bookId: 1,
        book: mockBook,
        userId: 1,
        user: mockUser,
        borrowedAt: new Date('2024-01-15'),
      };
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockRecord], 1]),
      };
      (borrowRecordRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      const result = await service.findAllBorrowedPaginated(undefined, 1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.meta).toMatchObject({
        total: 1,
        page: 1,
        limit: 20,
      });
    });
  });
});
