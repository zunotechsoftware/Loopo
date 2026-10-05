import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ProductsRepository } from '../repositories/products.repository';
import { CategoriesService } from '../../categories/services/categories.service';
import { AttributesService } from '../../categories/services/attributes.service';
import { InteractionsService } from '../../interactions/services/interactions.service';
import { SavedSearchesService } from '../../saved-searches/services/saved-searches.service';
import { RedisService } from '../../../shared/redis/redis.service';
import { getQueueToken } from '@nestjs/bullmq';
import { S3Service } from '../../../shared/services/s3.service';
import { AdminSettingsService } from '../../admin/settings/admin-settings.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('ProductsService Unit Tests', () => {
  let service: ProductsService;
  let productsRepoMock: any;
  let categoriesServiceMock: any;
  let attributesServiceMock: any;
  let redisServiceMock: any;
  let s3ServiceMock: any;
  let mockQueue: any;
  let adminSettingsServiceMock: any;

  beforeEach(async () => {
    productsRepoMock = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      createStatusHistory: jest.fn(),
      findAll: jest.fn(),
      count: jest.fn(),
      findActiveUserById: jest.fn(),
      hasGenuineInteraction: jest.fn(),
      markSoldWithBuyerTransaction: jest.fn(),
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

    const savedSearchesServiceMock = {
      notifyMatchingSearches: jest.fn().mockResolvedValue(0),
    };

    adminSettingsServiceMock = {
      getSettingByKey: jest.fn().mockResolvedValue({ value: { value: 30 } }),
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
        { provide: SavedSearchesService, useValue: savedSearchesServiceMock },
        { provide: AdminSettingsService, useValue: adminSettingsServiceMock },
        { provide: getQueueToken('product-image-compression'), useValue: mockQueue },
        { provide: getQueueToken('product-thumbnail-generation'), useValue: mockQueue },
        { provide: getQueueToken('product-expiration'), useValue: mockQueue },
        { provide: getQueueToken('search-index-update'), useValue: mockQueue },
        { provide: getQueueToken('view-counter-sync'), useValue: mockQueue },
        { provide: getQueueToken('notification'), useValue: mockQueue },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
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

  describe('markSoldWithBuyer (Rating Eligibility)', () => {
    const approvedProduct = {
      id: 'p-1',
      sellerId: 'seller-1',
      status: ProductStatus.APPROVED,
      slug: 'toyota-camry',
      title: 'Toyota Camry 2022',
      price: 2400000,
      currency: 'INR',
    };

    it('should throw if the caller is not the listing owner', async () => {
      productsRepoMock.findById.mockResolvedValue(approvedProduct);
      await expect(service.markSoldWithBuyer('p-1', 'not-the-seller', 'buyer-1')).rejects.toThrow();
    });

    it('should fall back to the legacy no-buyer path (no eligibility created) when no buyerId is given', async () => {
      productsRepoMock.findById.mockResolvedValue(approvedProduct);
      productsRepoMock.update.mockResolvedValue({ ...approvedProduct, status: ProductStatus.SOLD });

      await service.markSoldWithBuyer('p-1', 'seller-1', undefined);

      expect(productsRepoMock.markSoldWithBuyerTransaction).not.toHaveBeenCalled();
      expect(productsRepoMock.update).toHaveBeenCalled();
    });

    it('should reject an illegal status transition (e.g. already SOLD)', async () => {
      productsRepoMock.findById.mockResolvedValue({ ...approvedProduct, status: ProductStatus.SOLD });
      await expect(service.markSoldWithBuyer('p-1', 'seller-1', 'buyer-1')).rejects.toThrow(BadRequestException);
    });

    it('should reject the seller selecting themselves as the buyer (self-rating prevention)', async () => {
      productsRepoMock.findById.mockResolvedValue(approvedProduct);
      await expect(service.markSoldWithBuyer('p-1', 'seller-1', 'seller-1')).rejects.toThrow(BadRequestException);
    });

    it('should reject a buyer that does not exist', async () => {
      productsRepoMock.findById.mockResolvedValue(approvedProduct);
      productsRepoMock.findActiveUserById.mockResolvedValue(null);
      await expect(service.markSoldWithBuyer('p-1', 'seller-1', 'buyer-1')).rejects.toThrow(NotFoundException);
    });

    it('should reject a buyer with no genuine prior interaction (prevents fabricated eligibility)', async () => {
      productsRepoMock.findById.mockResolvedValue(approvedProduct);
      productsRepoMock.findActiveUserById.mockResolvedValue({ id: 'buyer-1', deletedAt: null });
      productsRepoMock.hasGenuineInteraction.mockResolvedValue(false);

      await expect(service.markSoldWithBuyer('p-1', 'seller-1', 'buyer-1')).rejects.toThrow(BadRequestException);
    });

    it('should mark sold, create the eligibility transactionally, and emit product.sold', async () => {
      productsRepoMock.findById.mockResolvedValueOnce(approvedProduct).mockResolvedValueOnce({
        ...approvedProduct,
        status: ProductStatus.SOLD,
      });
      productsRepoMock.findActiveUserById.mockResolvedValue({ id: 'buyer-1', deletedAt: null });
      productsRepoMock.hasGenuineInteraction.mockResolvedValue(true);
      adminSettingsServiceMock.getSettingByKey.mockResolvedValue({ value: { value: 30 } });
      productsRepoMock.markSoldWithBuyerTransaction.mockResolvedValue({
        product: { ...approvedProduct, status: ProductStatus.SOLD },
        order: { id: 'order-1' },
        eligibility: { id: 'eligibility-1' },
      });

      const eventEmitter = (service as any).eventEmitter;

      const result = await service.markSoldWithBuyer('p-1', 'seller-1', 'buyer-1');

      expect(productsRepoMock.markSoldWithBuyerTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ productId: 'p-1', sellerId: 'seller-1', buyerId: 'buyer-1' }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith('product.sold', expect.objectContaining({
        productId: 'p-1',
        sellerId: 'seller-1',
        buyerId: 'buyer-1',
      }));
      expect(result).toBeDefined();
    });
  });
});
