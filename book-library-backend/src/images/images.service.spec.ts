import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '../entities/image.entity';
import { ImagesService } from './images.service';

const mockExistsSync = jest.fn();
const mockUnlinkSync = jest.fn();
const mockCreateReadStream = jest.fn();

jest.mock('fs', () => {
  const actual = jest.requireActual<typeof import('fs')>('fs');
  return {
    ...actual,
    existsSync: (...args: unknown[]) => mockExistsSync(...args),
    unlinkSync: (...args: unknown[]) => mockUnlinkSync(...args),
    createReadStream: (...args: unknown[]) => mockCreateReadStream(...args),
  };
});

describe('ImagesService', () => {
  let service: ImagesService;
  let imageRepository: jest.Mocked<Repository<Image>>;

  const mockImage: Partial<Image> = {
    id: 1,
    fileName: 'test-123.jpg',
    filePath: '/uploads/test-123.jpg',
    mimeType: 'image/jpeg',
    fileSize: 1024,
    originalName: 'photo.jpg',
  };

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockImage], 1]),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        { provide: getRepositoryToken(Image), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ImagesService>(ImagesService);
    imageRepository = module.get(getRepositoryToken(Image));
    jest.clearAllMocks();
    mockExistsSync.mockReturnValue(true);
    mockUnlinkSync.mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFromFile', () => {
    it('should create image from uploaded file', async () => {
      const mockFile = {
        filename: 'test-123.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        originalname: 'photo.jpg',
      } as Express.Multer.File;
      (imageRepository.create as jest.Mock).mockReturnValue(mockImage);
      (imageRepository.save as jest.Mock).mockResolvedValue(mockImage);

      const result = await service.createFromFile(mockFile);

      expect(result).toEqual(mockImage);
      expect(imageRepository.create).toHaveBeenCalledWith({
        fileName: 'test-123.jpg',
        filePath: '/uploads/test-123.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1024,
        originalName: 'photo.jpg',
      });
      expect(imageRepository.save).toHaveBeenCalled();
    });

    it('should use default mimeType when not provided', async () => {
      const mockFile = {
        filename: 'test.jpg',
        mimetype: '',
        size: 0,
      } as Express.Multer.File;
      (imageRepository.create as jest.Mock).mockReturnValue(mockImage);
      (imageRepository.save as jest.Mock).mockResolvedValue(mockImage);

      await service.createFromFile(mockFile);

      expect(imageRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ mimeType: 'image/jpeg' }),
      );
    });
  });

  describe('findOne', () => {
    it('should return image by id', async () => {
      (imageRepository.findOne as jest.Mock).mockResolvedValue(mockImage);

      const result = await service.findOne(1);
      expect(result).toEqual(mockImage);
      expect(imageRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when image not found', async () => {
      (imageRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Image with id 999 not found');
    });
  });

  describe('findAll', () => {
    it('should return paginated images', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockImage], 1]),
      };
      (imageRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      const result = await service.findAll(1, 20);
      expect(result.data).toEqual([mockImage]);
      expect(result.meta).toMatchObject({
        total: 1,
        page: 1,
        limit: 20,
      });
    });

    it('should filter by search when provided', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      (imageRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      await service.findAll(1, 20, 'photo');
      expect(qb.where).toHaveBeenCalledWith(
        'image.original_name ILIKE :q OR image.file_name ILIKE :q',
        { q: '%photo%' },
      );
    });
  });

  describe('getFileStream', () => {
    it('should return stream and mimeType when file exists', () => {
      const mockStream = {} as NodeJS.ReadableStream;
      mockCreateReadStream.mockReturnValue(mockStream);
      mockExistsSync.mockReturnValue(true);

      const result = service.getFileStream(mockImage as Image);
      expect(result.stream).toBe(mockStream);
      expect(result.mimeType).toBe('image/jpeg');
      expect(mockCreateReadStream).toHaveBeenCalled();
    });

    it('should throw NotFoundException when file does not exist', () => {
      mockExistsSync.mockReturnValue(false);

      expect(() => service.getFileStream(mockImage as Image)).toThrow(NotFoundException);
      expect(() => service.getFileStream(mockImage as Image)).toThrow('Image file not found');
    });
  });

  describe('remove', () => {
    it('should remove image and delete file from disk', async () => {
      (imageRepository.findOne as jest.Mock).mockResolvedValue(mockImage);
      (imageRepository.remove as jest.Mock).mockResolvedValue(mockImage);
      mockExistsSync.mockReturnValue(true);

      await service.remove(1);
      expect(imageRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockUnlinkSync).toHaveBeenCalled();
      expect(imageRepository.remove).toHaveBeenCalledWith(mockImage);
    });

    it('should remove from DB even when file not found on disk', async () => {
      (imageRepository.findOne as jest.Mock).mockResolvedValue(mockImage);
      (imageRepository.remove as jest.Mock).mockResolvedValue(mockImage);
      mockExistsSync.mockReturnValue(false);

      await service.remove(1);
      expect(imageRepository.remove).toHaveBeenCalledWith(mockImage);
    });

    it('should throw NotFoundException when image not found', async () => {
      (imageRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(imageRepository.remove).not.toHaveBeenCalled();
    });
  });
});
