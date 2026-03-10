import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { ImagesService } from '../images/images.service';

describe('BooksController', () => {
  let controller: BooksController;
  let booksService: jest.Mocked<BooksService>;
  let imagesService: jest.Mocked<ImagesService>;

  const mockBook = {
    id: 1,
    title: 'Test Book',
    author: 'Author',
    isbn: '978-0-13-235088-4',
    publicationYear: 2020,
    totalQuantity: 2,
    availableQuantity: 2,
  };

  const mockPaginatedResponse = {
    data: [mockBook],
    meta: { total: 1, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false },
  };

  beforeEach(async () => {
    const mockBooksService = {
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      borrow: jest.fn(),
      returnBook: jest.fn(),
      findBorrowedByUser: jest.fn(),
      findAllBorrowed: jest.fn(),
      findAllBorrowedPaginated: jest.fn(),
      findBorrowedByUserId: jest.fn(),
      returnBorrowRecord: jest.fn(),
    };
    const mockImagesService = {
      createFromFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        { provide: BooksService, useValue: mockBooksService },
        { provide: ImagesService, useValue: mockImagesService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BooksController>(BooksController);
    booksService = module.get(BooksService);
    imagesService = module.get(ImagesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all books when no pagination params', async () => {
      booksService.findAll.mockResolvedValue([mockBook] as never);

      const result = await controller.findAll({});
      expect(booksService.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([mockBook]);
    });

    it('should return paginated books when page/limit provided', async () => {
      booksService.findAllPaginated.mockResolvedValue(mockPaginatedResponse as never);

      const result = await controller.findAll({ page: 1, limit: 20 });
      expect(booksService.findAllPaginated).toHaveBeenCalledWith(
        undefined,
        1,
        20,
        'createdAt',
        'desc',
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should pass search to findAll', async () => {
      booksService.findAll.mockResolvedValue([mockBook] as never);

      await controller.findAll({ search: 'test' });
      expect(booksService.findAll).toHaveBeenCalledWith('test');
    });
  });

  describe('getMyBorrowed', () => {
    it('should return borrowed books for authenticated user', async () => {
      const req = { user: { id: 1 } } as Request;
      booksService.findBorrowedByUser.mockResolvedValue([mockBook] as never);

      const result = await controller.getMyBorrowed(req);
      expect(booksService.findBorrowedByUser).toHaveBeenCalledWith(1);
      expect(result).toEqual([mockBook]);
    });

    it('should throw UnauthorizedException when no user', async () => {
      const req = {} as Request;
      await expect(controller.getMyBorrowed(req)).rejects.toThrow(UnauthorizedException);
      expect(booksService.findBorrowedByUser).not.toHaveBeenCalled();
    });
  });

  describe('getAllBorrowed', () => {
    it('should return all borrowed when no pagination', async () => {
      booksService.findAllBorrowed.mockResolvedValue([{ id: 1, book: mockBook }] as never);

      const result = await controller.getAllBorrowed({});
      expect(booksService.findAllBorrowed).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should return paginated borrowed when page/limit provided', async () => {
      booksService.findAllBorrowedPaginated.mockResolvedValue(mockPaginatedResponse as never);

      const result = await controller.getAllBorrowed({ page: 1, limit: 20 });
      expect(booksService.findAllBorrowedPaginated).toHaveBeenCalledWith(
        undefined,
        1,
        20,
        'borrowedAt',
        'desc',
      );
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('getBorrowedByUser', () => {
    it('should return borrowed records for user', async () => {
      booksService.findBorrowedByUserId.mockResolvedValue([{ id: 1, book: mockBook }] as never);

      const result = await controller.getBorrowedByUser(5);
      expect(booksService.findBorrowedByUserId).toHaveBeenCalledWith(5);
      expect(result).toHaveLength(1);
    });
  });

  describe('adminReturnBook', () => {
    it('should call returnBorrowRecord', async () => {
      booksService.returnBorrowRecord.mockResolvedValue({ id: 10 } as never);

      const result = await controller.adminReturnBook(10);
      expect(booksService.returnBorrowRecord).toHaveBeenCalledWith(10);
      expect(result).toEqual({ id: 10 });
    });
  });

  describe('findOne', () => {
    it('should return book by id', async () => {
      booksService.findOne.mockResolvedValue(mockBook as never);

      const result = await controller.findOne(1);
      expect(booksService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockBook);
    });
  });

  describe('create', () => {
    it('should create book without file', async () => {
      const dto = {
        title: 'New Book',
        author: 'Author',
        isbn: '978-0-13-235088-4',
        publicationYear: 2024,
      };
      booksService.create.mockResolvedValue({ ...mockBook, ...dto } as never);

      const result = await controller.create(dto);
      expect(imagesService.createFromFile).not.toHaveBeenCalled();
      expect(booksService.create).toHaveBeenCalledWith(dto, undefined);
      expect(result).toBeDefined();
    });

    it('should create book with uploaded file', async () => {
      const dto = {
        title: 'New Book',
        author: 'Author',
        isbn: '978-0-13-235088-4',
        publicationYear: 2024,
      };
      const file = { filename: 'cover.jpg' } as Express.Multer.File;
      imagesService.createFromFile.mockResolvedValue({ id: 5 } as never);
      booksService.create.mockResolvedValue({ ...mockBook, coverImageId: 5 } as never);

      const result = await controller.create(dto, file);
      expect(imagesService.createFromFile).toHaveBeenCalledWith(file);
      expect(booksService.create).toHaveBeenCalledWith(dto, 5);
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update book with removeCover', async () => {
      const dto = { removeCover: true };
      booksService.update.mockResolvedValue({ ...mockBook, coverImageId: undefined } as never);

      const result = await controller.update(1, dto);
      expect(booksService.update).toHaveBeenCalledWith(1, dto, undefined);
      expect(result).toBeDefined();
    });

    it('should update book with new cover file', async () => {
      const dto = {};
      const file = { filename: 'new-cover.jpg' } as Express.Multer.File;
      imagesService.createFromFile.mockResolvedValue({ id: 7 } as never);
      booksService.update.mockResolvedValue({ ...mockBook, coverImageId: 7 } as never);

      const result = await controller.update(1, dto, file);
      expect(imagesService.createFromFile).toHaveBeenCalledWith(file);
      expect(booksService.update).toHaveBeenCalledWith(1, dto, 7);
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should delete book and return message', async () => {
      booksService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1);
      expect(booksService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Book deleted successfully' });
    });
  });

  describe('borrow', () => {
    it('should borrow book for authenticated user', async () => {
      const req = { user: { id: 2 } } as Request;
      booksService.borrow.mockResolvedValue(mockBook as never);

      const result = await controller.borrow(1, req);
      expect(booksService.borrow).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual(mockBook);
    });

    it('should throw UnauthorizedException when no user', async () => {
      const req = {} as Request;
      await expect(controller.borrow(1, req)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('returnBook', () => {
    it('should return book for authenticated user', async () => {
      const req = { user: { id: 2 } } as Request;
      booksService.returnBook.mockResolvedValue(mockBook as never);

      const result = await controller.returnBook(1, req);
      expect(booksService.returnBook).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual(mockBook);
    });

    it('should throw UnauthorizedException when no user', async () => {
      const req = {} as Request;
      await expect(controller.returnBook(1, req)).rejects.toThrow(UnauthorizedException);
    });
  });
});
