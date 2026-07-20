import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ProductsRepository } from '../repositories/products.repository';
import { CategoriesService } from '../../categories/services/categories.service';
import { AttributesService } from '../../categories/services/attributes.service';
import { InteractionsService } from '../../interactions/services/interactions.service';
import { RedisService } from '../../../shared/redis/redis.service';
import { getQueueToken } from '@nestjs/bullmq';
import { S3Service } from '../../../shared/services/s3.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';

describe('ProductsService Unit Tests', () => {
  let service: ProductsService;
  let productsRepoMock: any;
  let categoriesServiceMock: any;
  let attributesServiceMock: any;
  let redisServiceMock: any;
  let s3ServiceMock: any;
  let mockQueue: any;

  beforeEach(async () => {
    productsRepoMock = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      createStatusHistory: jest.fn(),
      findAll: jest.fn(),
      count: jest.fn(),
    };

    categoriesServiceMock = {
      getCategoryDetails: jest.fn(),
    };

    attributesServiceMock = {
      getCategoryAttributes: jest.fn(),
    };

    redisServiceMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
    };

    s3ServiceMock = {
      generatePresignedUploadUrl: jest.fn(),
      deleteFile: jest.fn(),
    };

    mockQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-id' }),
    };

    const interactionsServiceMock = {
      recordRecentlyViewed: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ProductsRepository, useValue: productsRepoMock },
        { provide: CategoriesService, useValue: categoriesServiceMock },
        { provide: AttributesService, useValue: attributesServiceMock },
        { provide: RedisService, useValue: redisServiceMock },
        { provide: S3Service, useValue: s3ServiceMock },
        { provide: InteractionsService, useValue: interactionsServiceMock },
        { provide: getQueueToken('image-compression'), useValue: mockQueue },
        { provide: getQueueToken('thumbnail-generation'), useValue: mockQueue },
        { provide: getQueueToken('product-expiration'), useValue: mockQueue },
        { provide: getQueueToken('search-index-update'), useValue: mockQueue },
        { provide: getQueueToken('view-counter-sync'), useValue: mockQueue },
        { provide: getQueueToken('notification'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('createProduct (Validations)', () => {
    it('should create listing and generate slug on success', async () => {
      const dto = {
        title: 'Toyota Camry 2022',
        description: 'Excellent luxury sedan, original paint.',
        categoryId: 'cat-id',
        condition: 'GOOD' as any,
        price: 2400000,
        location: { country: 'India', state: 'Delhi', city: 'Delhi' },
      };

      categoriesServiceMock.getCategoryDetails.mockResolvedValue({ id: 'cat-id', name: 'Cars' });
      productsRepoMock.create.mockResolvedValue({ id: 'p-1', title: dto.title, slug: 'toyota-camry-2022-1234' });

      const result = await service.createProduct(dto, 'seller-1');

      expect(result).toBeDefined();
      expect(productsRepoMock.create).toHaveBeenCalled();
      expect(mockQueue.add).toHaveBeenCalled(); // Search indexing triggered
    });

    it('should fail if category is not found', async () => {
      const dto = {
        title: 'Toyota Camry 2022',
        description: 'Excellent luxury sedan, original paint.',
        categoryId: 'invalid-cat',
        condition: 'GOOD' as any,
        price: 2400000,
        location: { country: 'India', state: 'Delhi', city: 'Delhi' },
      };

      categoriesServiceMock.getCategoryDetails.mockResolvedValue(null);

      await expect(service.createProduct(dto, 'seller-1')).rejects.toThrow(NotFoundException);
    });

    it('should fail validation if required category attribute is missing in request', async () => {
      const dto = {
        title: 'Toyota Camry 2022',
        description: 'Excellent luxury sedan, original paint.',
        categoryId: 'cat-id',
        condition: 'GOOD' as any,
        price: 2400000,
        location: { country: 'India', state: 'Delhi', city: 'Delhi' },
        attributes: [{ attributeId: 'attr-1', value: 'Petrol' }],
      };

      categoriesServiceMock.getCategoryDetails.mockResolvedValue({ id: 'cat-id' });
      
      // Attribute schema has two attributes (attr-1 optional, attr-2 required)
      attributesServiceMock.getCategoryAttributes.mockResolvedValue([
        { id: 'attr-1', name: 'Fuel', isRequired: false },
        { id: 'attr-2', name: 'Year', isRequired: true }, // Missing in request
      ]);

      await expect(service.createProduct(dto, 'seller-1')).rejects.toThrow(BadRequestException);
    });

    it('should fail validation if dynamic attribute regex does not match input', async () => {
      const dto = {
        title: 'Toyota Camry 2022',
        description: 'Excellent luxury sedan, original paint.',
        categoryId: 'cat-id',
        condition: 'GOOD' as any,
        price: 2400000,
        location: { country: 'India', state: 'Delhi', city: 'Delhi' },
        attributes: [{ attributeId: 'attr-1', value: 'INVALID_YEAR' }],
      };

      categoriesServiceMock.getCategoryDetails.mockResolvedValue({ id: 'cat-id' });
      
      // Year regex validator matching four digits
      attributesServiceMock.getCategoryAttributes.mockResolvedValue([
        { id: 'attr-1', name: 'Year', isRequired: true, regex: '^\\d{4}$' },
      ]);

      await expect(service.createProduct(dto, 'seller-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('approveProduct (Approval Workflow)', () => {
    it('should update listing status to APPROVED and set expiresAt (+30 days)', async () => {
      const product = { id: 'p-1', sellerId: 'seller-1', status: ProductStatus.PENDING, slug: 'toyota-camry' };
      productsRepoMock.findById.mockResolvedValue(product);
      productsRepoMock.update.mockResolvedValue({ ...product, status: ProductStatus.APPROVED });

      const result = await service.approveProduct('p-1', 'moderator-1');

      expect(result).toBeDefined();
      expect(result!.status).toBe('APPROVED');
      expect(productsRepoMock.update).toHaveBeenCalledWith(
        'p-1',
        expect.objectContaining({
          product: expect.objectContaining({
            status: 'APPROVED',
            publishedAt: expect.any(Date),
            expiresAt: expect.any(Date),
          }),
        }),
      );
    });
  });
});
