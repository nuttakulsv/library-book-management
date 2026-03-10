import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createReadStream, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm';
import {
  PaginatedResponse,
  createPaginationMeta,
} from '../common/types/pagination.types';
import { Image } from '../entities/image.entity';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  async createFromFile(file: Express.Multer.File): Promise<Image> {
    const filePath = `/uploads/${file.filename}`;
    const image = this.imageRepository.create({
      fileName: file.filename,
      filePath,
      mimeType: file.mimetype || 'image/jpeg',
      fileSize: file.size || 0,
      originalName: file.originalname ?? undefined,
    });
    return this.imageRepository.save(image);
  }

  async findOne(id: number): Promise<Image> {
    const image = await this.imageRepository.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException(`Image with id ${id} not found`);
    }
    return image;
  }

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
  ): Promise<PaginatedResponse<Image>> {
    const qb = this.imageRepository.createQueryBuilder('image');
    if (search?.trim()) {
      const q = `%${search.trim()}%`;
      qb.where(
        'image.original_name ILIKE :q OR image.file_name ILIKE :q',
        { q },
      );
    }
    qb.orderBy('image.created_at', 'DESC');

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: createPaginationMeta(total, page, limit),
    };
  }

  getFileStream(image: Image): { stream: NodeJS.ReadableStream; mimeType: string } {
    const fullPath = join(process.cwd(), image.filePath.replace(/^\//, ''));
    if (!existsSync(fullPath)) {
      throw new NotFoundException('Image file not found');
    }
    return {
      stream: createReadStream(fullPath),
      mimeType: image.mimeType,
    };
  }

  async remove(id: number): Promise<void> {
    const image = await this.findOne(id);
    const fullPath = join(process.cwd(), image.filePath.replace(/^\//, ''));
    if (existsSync(fullPath)) {
      try {
        unlinkSync(fullPath);
      } catch {
        // Ignore file delete errors
      }
    }
    await this.imageRepository.remove(image);
  }
}
