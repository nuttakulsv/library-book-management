import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BorrowRecord } from '../entities/borrow-record.entity';
import { Book } from '../entities/book.entity';
import { ImagesModule } from '../images/images.module';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, BorrowRecord]),
    AuthModule,
    ImagesModule,
  ],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
