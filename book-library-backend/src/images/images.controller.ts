import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { fromPaginationQuery } from '../common/types/pagination.types';
import { DeleteResponseDto } from '../common/dto/delete-response.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ImagesService } from './images.service';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          const name = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, name + (extname(file.originalname) || '.jpg'));
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
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.imagesService.createFromFile(file);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findAll(@Query() query: PaginationQueryDto) {
    const { page, limit, search } = fromPaginationQuery(query);
    return this.imagesService.findAll(page, limit, search);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.imagesService.findOne(id);
  }

  @Get(':id/file')
  async getFile(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const image = await this.imagesService.findOne(id);
    const { stream, mimeType } = this.imagesService.getFileStream(image);
    res.set({
      'Content-Type': mimeType,
      'Cache-Control': 'public, max-age=31536000',
    });
    stream.pipe(res);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<DeleteResponseDto> {
    await this.imagesService.remove(id);
    return { message: 'Image deleted successfully' };
  }
}
