import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { fromPaginationQuery } from '../common/types/pagination.types';
import { DeleteResponseDto } from '../common/dto/delete-response.dto';
import { ImagesService } from '../images/images.service';
import { BooksService } from './books.service';
import { BookSearchQueryDto } from './dto/book-search-query.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    private readonly imagesService: ImagesService,
  ) {}

  @Get()
  async findAll(@Query() query: BookSearchQueryDto) {
    const usePagination = query.page !== undefined || query.limit !== undefined;
    if (usePagination) {
      const { page, limit, search, sortBy, sortOrder } = fromPaginationQuery(
        query,
        { sortBy: 'createdAt' },
      );
      return this.booksService.findAllPaginated(search, page, limit, sortBy, sortOrder);
    }
    return this.booksService.findAll(query.search);
  }

  @Get('borrowed/my')
  @UseGuards(JwtAuthGuard)
  async getMyBorrowed(@Req() req: Request) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('User not found');
    return this.booksService.findBorrowedByUser(user.id);
  }

  @Get('borrowed/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAllBorrowed(@Query() query: BookSearchQueryDto) {
    const usePagination = query.page !== undefined || query.limit !== undefined;
    if (usePagination) {
      const { page, limit, search, sortBy, sortOrder } = fromPaginationQuery(
        query,
        { sortBy: 'borrowedAt' },
      );
      return this.booksService.findAllBorrowedPaginated(search, page, limit, sortBy, sortOrder);
    }
    return this.booksService.findAllBorrowed();
  }

  @Get('borrowed/by-user/:userId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getBorrowedByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.booksService.findBorrowedByUserId(userId);
  }

  @Post('borrowed/:recordId/return')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async adminReturnBook(@Param('recordId', ParseIntPipe) recordId: number) {
    return this.booksService.returnBorrowRecord(recordId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(
    FileInterceptor('coverImage', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          const name = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, name + extname(file.originalname) || '.jpg');
        },
      }),
      fileFilter: (_, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
        if (allowed.test(file.originalname)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files allowed'), false);
        }
      },
    }),
  )
  async create(
    @Body() dto: CreateBookDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let coverImageId: number | undefined = dto.coverImageId;
    if (file) {
      const image = await this.imagesService.createFromFile(file);
      coverImageId = image.id;
    }
    return this.booksService.create(dto, coverImageId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(
    FileInterceptor('coverImage', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          const name = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, name + extname(file.originalname) || '.jpg');
        },
      }),
      fileFilter: (_, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
        if (allowed.test(file.originalname)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files allowed'), false);
        }
      },
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let coverImageId: number | undefined = dto.coverImageId;
    if (dto.removeCover) {
      coverImageId = undefined;
    } else if (file) {
      const image = await this.imagesService.createFromFile(file);
      coverImageId = image.id;
    }
    return this.booksService.update(id, dto, coverImageId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<DeleteResponseDto> {
    await this.booksService.remove(id);
    return { message: 'Book deleted successfully' };
  }

  @Post(':id/borrow')
  @UseGuards(JwtAuthGuard)
  async borrow(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('User not found');
    return this.booksService.borrow(id, user.id);
  }

  @Post(':id/return')
  @UseGuards(JwtAuthGuard)
  async returnBook(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('User not found');
    return this.booksService.returnBook(id, user.id);
  }
}
