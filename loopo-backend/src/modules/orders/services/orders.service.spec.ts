import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { OrdersRepository } from '../repositories/orders.repository';
import { PrismaService } from '../../../shared/database/prisma.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { OrderStatus, ProductStatus } from '@prisma/client';

describe('OrdersService Unit Tests', () => {
  let service: OrdersService;
  let repositoryMock: any;
  let prismaMock: any;

  beforeEach(async () => {
    repositoryMock = {
      findById: jest.fn(),
      findForBuyer: jest.fn(),
      findForSeller: jest.fn(),
      updateStatus: jest.fn(),
    };

    prismaMock = {
      product: {
        findUnique: jest.fn(),
      },
      order: {
        create: jest.fn(),
        update: jest.fn(),
      },
      sellerProfile: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn((cb) => cb(prismaMock)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersRepository, useValue: repositoryMock },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should place order and update product quantity and seller sales', async () => {
      const mockProduct = {
        id: 'prod-id',
        sellerId: 'seller-id',
        price: 100,
        currency: 'INR',
        status: ProductStatus.APPROVED,
        quantity: 5,
      };

      prismaMock.product.findUnique.mockResolvedValue(mockProduct);
      prismaMock.sellerProfile.findUnique.mockResolvedValue({ userId: 'seller-id' });
      
      const mockOrder = { id: 'order-id', buyerId: 'buyer-id', sellerId: 'seller-id', totalAmount: 200 };
      prismaMock.order.create.mockResolvedValue(mockOrder);
      prismaMock.product.update = jest.fn();
      prismaMock.sellerProfile.update = jest.fn();

      const result = await service.createOrder('buyer-id', { productId: 'prod-id', quantity: 2 });
      expect(result).toEqual(mockOrder);
      expect(prismaMock.order.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product does not exist', async () => {
      prismaMock.product.findUnique.mockResolvedValue(null);

      await expect(
        service.createOrder('buyer-id', { productId: 'prod-id', quantity: 1 })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if product is not approved', async () => {
      prismaMock.product.findUnique.mockResolvedValue({
        id: 'prod-id',
        status: ProductStatus.PENDING,
        quantity: 5,
      });

      await expect(
        service.createOrder('buyer-id', { productId: 'prod-id', quantity: 1 })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if buying own product', async () => {
      prismaMock.product.findUnique.mockResolvedValue({
        id: 'prod-id',
        sellerId: 'buyer-id',
        status: ProductStatus.APPROVED,
        quantity: 5,
      });

      await expect(
        service.createOrder('buyer-id', { productId: 'prod-id', quantity: 1 })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getOrderDetails', () => {
    it('should return order details for the buyer or seller', async () => {
      const mockOrder = { id: 'order-id', buyerId: 'buyer-id', sellerId: 'seller-id' };
      repositoryMock.findById.mockResolvedValue(mockOrder);

      const result = await service.getOrderDetails('order-id', 'buyer-id', ['USER']);
      expect(result).toEqual(mockOrder);
    });

    it('should throw ForbiddenException if user is not party to order', async () => {
      const mockOrder = { id: 'order-id', buyerId: 'buyer-id', sellerId: 'seller-id' };
      repositoryMock.findById.mockResolvedValue(mockOrder);

      await expect(
        service.getOrderDetails('order-id', 'other-user', ['USER'])
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
