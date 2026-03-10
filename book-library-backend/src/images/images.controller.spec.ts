import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';

describe('ImagesController', () => {
  let controller: ImagesController;
  let imagesService: jest.Mocked<ImagesService>;

  const mockImage = {
    id: 1,
    fileName: 'test.jpg',
    filePath: '/uploads/test.jpg',
    mimeType: 'image/jpeg',
    fileSize: 1024,
  };

  const mockPaginatedResponse = {
    data: [mockImage],
    meta: { total: 1, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false },
  };

  beforeEach(async () => {
    const mockImagesService = {
      createFromFile: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      getFileStream: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImagesController],
      providers: [
        { provide: ImagesService, useValue: mockImagesService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ImagesController>(ImagesController);
    imagesService = module.get(ImagesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('upload', () => {
    it('should create image from file', async () => {
      const file = { filename: 'test.jpg', mimetype: 'image/jpeg' } as Express.Multer.File;
      imagesService.createFromFile.mockResolvedValue(mockImage as never);

      const result = await controller.upload(file);
      expect(imagesService.createFromFile).toHaveBeenCalledWith(file);
      expect(result).toEqual(mockImage);
    });
  });

  describe('findAll', () => {
    it('should return paginated images', async () => {
      imagesService.findAll.mockResolvedValue(mockPaginatedResponse as never);

      const result = await controller.findAll({ page: 1, limit: 20 });
      expect(imagesService.findAll).toHaveBeenCalledWith(1, 20, undefined);
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should pass search to findAll', async () => {
      imagesService.findAll.mockResolvedValue(mockPaginatedResponse as never);

      await controller.findAll({ page: 1, limit: 20, search: 'photo' });
      expect(imagesService.findAll).toHaveBeenCalledWith(1, 20, 'photo');
    });
  });

  describe('findOne', () => {
    it('should return image by id', async () => {
      imagesService.findOne.mockResolvedValue(mockImage as never);

      const result = await controller.findOne(1);
      expect(imagesService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockImage);
    });
  });

  describe('getFile', () => {
    it('should pipe stream to response', async () => {
      const mockStream = { pipe: jest.fn() } as unknown as NodeJS.ReadableStream;
      imagesService.findOne.mockResolvedValue(mockImage as never);
      imagesService.getFileStream.mockReturnValue({
        stream: mockStream,
        mimeType: 'image/jpeg',
      });
      const res = {
        set: jest.fn(),
      } as unknown as Response;

      await controller.getFile(1, res);
      expect(imagesService.findOne).toHaveBeenCalledWith(1);
      expect(imagesService.getFileStream).toHaveBeenCalledWith(mockImage);
      expect(res.set).toHaveBeenCalledWith({
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
      });
      expect(mockStream.pipe).toHaveBeenCalledWith(res);
    });
  });

  describe('remove', () => {
    it('should delete image and return message', async () => {
      imagesService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1);
      expect(imagesService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Image deleted successfully' });
    });
  });
});
