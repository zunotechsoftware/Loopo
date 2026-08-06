import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { CategoriesRepository } from '../repositories/categories.repository';
import { RedisService } from '../../../shared/redis/redis.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repoMock: any;
  let redisMock: any;

  beforeEach(async () => {
    repoMock = {
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findAll: jest.fn(),
      findTree: jest.fn(),
      findAncestors: jest.fn(),
    };

    redisMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: CategoriesRepository, useValue: repoMock },
        { provide: RedisService, useValue: redisMock },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  describe('createCategory', () => {
    it('should create root category and generate unique slug', async () => {
      const dto = { name: 'Vehicles & Automobiles', description: 'Cars and bikes' };
      repoMock.findBySlug.mockResolvedValue(null);
      repoMock.create.mockResolvedValue({ id: 'cat-1', name: dto.name, slug: 'vehicles-automobiles' });

      const result = await service.createCategory(dto, 'user-1');

      expect(result).toBeDefined();
      expect(repoMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: dto.name,
          slug: 'vehicles-automobiles',
          level: 0,
          createdBy: 'user-1',
        }),
      );
      expect(redisMock.del).toHaveBeenCalledWith('categories:tree');
    });

    it('should create nested child category and build path slug', async () => {
      const parent = { id: 'parent-id', name: 'Vehicles', slug: 'vehicles', level: 0 };
      const dto = { name: 'SUV Cars', parentId: 'parent-id' };

      repoMock.findById.mockResolvedValue(parent);
      repoMock.findBySlug.mockResolvedValue(null);
      repoMock.create.mockResolvedValue({ id: 'child-id', name: dto.name, slug: 'vehicles-suv-cars' });

      const result = await service.createCategory(dto, 'user-1');

      expect(result).toBeDefined();
      expect(repoMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: dto.name,
          slug: 'vehicles-suv-cars',
          level: 1,
          parentId: 'parent-id',
        }),
      );
    });

    it('should fail to create child category if parent is not found', async () => {
      const dto = { name: 'Cars', parentId: 'non-existent-parent' };
      repoMock.findById.mockResolvedValue(null);

      await expect(service.createCategory(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCategory (hierarchical validation)', () => {
    it('should fail when moving category under itself', async () => {
      const category = { id: 'cat-1', name: 'Cars', slug: 'cars', parentId: null };
      repoMock.findById.mockResolvedValue(category);

      await expect(service.updateCategory('cat-1', { parentId: 'cat-1' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should fail when cyclic reference detected (parent under child)', async () => {
      const parent = { id: 'parent-id', name: 'Vehicles', slug: 'vehicles', parentId: null };
      const child = { id: 'child-id', name: 'Cars', slug: 'vehicles-cars', parentId: 'parent-id' };

      repoMock.findById
        .mockResolvedValueOnce(parent) // when fetching parent to update
        .mockResolvedValueOnce(child);  // when fetching child to verify parentId exist

      // Mock ancestor path of the new parent (child-id)
      repoMock.findAncestors.mockResolvedValue([
        { id: 'parent-id', name: 'Vehicles' },
        { id: 'child-id', name: 'Cars' },
      ]);

      await expect(service.updateCategory('parent-id', { parentId: 'child-id' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getCategoryTree (caching)', () => {
    it('should return cached tree if present in Redis', async () => {
      const cachedTree = JSON.stringify([{ id: '1', name: 'Vehicles', children: [] }]);
      redisMock.get.mockResolvedValue(cachedTree);

      const result = await service.getCategoryTree();

      expect(result).toBeDefined();
      expect(result[0].name).toBe('Vehicles');
      expect(repoMock.findTree).not.toHaveBeenCalled();
    });

    it('should build tree from database and cache on cache-miss', async () => {
      const dbCategories = [
        { id: '1', name: 'Vehicles', parentId: null, sortOrder: 1 },
        { id: '2', name: 'Cars', parentId: '1', sortOrder: 1 },
      ];
      redisMock.get.mockResolvedValue(null);
      repoMock.findTree.mockResolvedValue(dbCategories);

      const result = await service.getCategoryTree();

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].children.length).toBe(1);
      expect(result[0].children[0].id).toBe('2');
      expect(redisMock.set).toHaveBeenCalledWith(
        'categories:tree',
        expect.any(String),
        expect.any(Number),
      );
    });
  });
});
