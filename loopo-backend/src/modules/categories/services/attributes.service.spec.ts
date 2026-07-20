import { Test, TestingModule } from '@nestjs/testing';
import { AttributesService } from './attributes.service';
import { AttributesRepository } from '../repositories/attributes.repository';
import { CategoriesRepository } from '../repositories/categories.repository';
import { RedisService } from '../../../shared/redis/redis.service';
import { BadRequestException } from '@nestjs/common';
import { AttributeType } from '@prisma/client';

describe('AttributesService', () => {
  let service: AttributesService;
  let attrRepoMock: any;
  let catRepoMock: any;
  let redisMock: any;

  beforeEach(async () => {
    attrRepoMock = {
      createGroup: jest.fn(),
      updateGroup: jest.fn(),
      deleteGroup: jest.fn(),
      findGroupById: jest.fn(),
      findGroupsByCategoryId: jest.fn(),
      createAttribute: jest.fn(),
      updateAttribute: jest.fn(),
      softDeleteAttribute: jest.fn(),
      findAttributeById: jest.fn(),
      findAttributesByCategoryId: jest.fn(),
      findAttributesByCategoryIds: jest.fn(),
      findAttributeBySlug: jest.fn(),
      createOption: jest.fn(),
      updateOption: jest.fn(),
      deleteOption: jest.fn(),
      findOptionById: jest.fn(),
      findOptionsByAttributeId: jest.fn(),
    };

    catRepoMock = {
      findById: jest.fn(),
      findAncestors: jest.fn(),
      findChildren: jest.fn(),
    };

    redisMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttributesService,
        { provide: AttributesRepository, useValue: attrRepoMock },
        { provide: CategoriesRepository, useValue: catRepoMock },
        { provide: RedisService, useValue: redisMock },
      ],
    }).compile();

    service = module.get<AttributesService>(AttributesService);
  });

  describe('createAttribute', () => {
    it('should create an attribute and invalidate category attributes caches', async () => {
      const dto = {
        name: 'Transmission Type',
        type: AttributeType.SELECT,
        isRequired: true,
      };

      catRepoMock.findById.mockResolvedValue({ id: 'cat-1', name: 'Cars' });
      attrRepoMock.findAttributeBySlug.mockResolvedValue(null);
      attrRepoMock.createAttribute.mockResolvedValue({ id: 'attr-1', ...dto, slug: 'transmission-type' });
      catRepoMock.findChildren.mockResolvedValue([]);

      const result = await service.createAttribute('cat-1', dto, 'user-1');

      expect(result).toBeDefined();
      expect(attrRepoMock.createAttribute).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryId: 'cat-1',
          name: dto.name,
          slug: 'transmission-type',
          type: 'SELECT',
        }),
      );
      expect(redisMock.del).toHaveBeenCalledWith('categories:attributes:cat-1:true');
      expect(redisMock.del).toHaveBeenCalledWith('categories:attributes:cat-1:false');
    });

    it('should fail if attribute slug is not unique in the category', async () => {
      const dto = { name: 'Transmission Type', type: AttributeType.SELECT };

      catRepoMock.findById.mockResolvedValue({ id: 'cat-1', name: 'Cars' });
      attrRepoMock.findAttributeBySlug.mockResolvedValue({ id: 'existing-attr' });

      await expect(service.createAttribute('cat-1', dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCategoryAttributes (Inherited Attributes)', () => {
    it('should resolve and fetch merged ancestor path attributes when includeInherited=true', async () => {
      const parentAttr = { id: 'attr-parent', name: 'Brand', categoryId: 'cat-parent' };
      const childAttr = { id: 'attr-child', name: 'SUV Model', categoryId: 'cat-child' };

      redisMock.get.mockResolvedValue(null);
      catRepoMock.findAncestors.mockResolvedValue([
        { id: 'cat-parent', name: 'Vehicles' },
        { id: 'cat-child', name: 'Cars' },
      ]);
      attrRepoMock.findAttributesByCategoryIds.mockResolvedValue([parentAttr, childAttr]);

      const result = await service.getCategoryAttributes('cat-child', true);

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(attrRepoMock.findAttributesByCategoryIds).toHaveBeenCalledWith(['cat-parent', 'cat-child']);
    });

    it('should fetch only self attributes when includeInherited=false', async () => {
      const childAttr = { id: 'attr-child', name: 'SUV Model', categoryId: 'cat-child' };

      redisMock.get.mockResolvedValue(null);
      attrRepoMock.findAttributesByCategoryId.mockResolvedValue([childAttr]);

      const result = await service.getCategoryAttributes('cat-child', false);

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('attr-child');
      expect(attrRepoMock.findAttributesByCategoryIds).not.toHaveBeenCalled();
    });
  });
});
