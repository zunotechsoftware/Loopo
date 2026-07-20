import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { RejectProductDto, FeatureProductDto, BoostProductDto } from './dto/admin-product.dto';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class AdminProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllProducts(skip: number = 0, take: number = 20, status?: ProductStatus, search?: string) {
    const where: any = { deletedAt: null };
    if (status) where.status = status;
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }
    
    return this.prisma.product.findMany({
      where,
      skip,
      take,
      include: { seller: { select: { id: true, email: true, firstName: true } }, category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        seller: true,
        category: true,
        images: true,
        videos: true,
        attributes: { include: { attribute: true } },
        location: true,
      },
    });

    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async updateProductStatus(id: string, adminId: string, status: ProductStatus, reason?: string) {
    const product = await this.getProductById(id);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: {
          status,
          rejectionReason: reason || null,
          updatedBy: adminId,
          publishedAt: status === 'APPROVED' && !product.publishedAt ? new Date() : product.publishedAt,
        },
      });

      await tx.productStatusHistory.create({
        data: {
          productId: id,
          fromStatus: product.status,
          toStatus: status,
          comment: reason,
          changedById: adminId,
        },
      });

      return updated;
    });
  }

  async featureProduct(id: string, adminId: string, dto: FeatureProductDto) {
    await this.getProductById(id);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + dto.durationDays);

    return this.prisma.featuredProduct.create({
      data: {
        productId: id,
        durationDays: dto.durationDays,
        endDate,
      },
    });
  }

  async boostProduct(id: string, adminId: string, dto: BoostProductDto) {
    await this.getProductById(id);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + dto.durationDays);

    return this.prisma.boostedProduct.create({
      data: {
        productId: id,
        packageName: dto.packageName,
        endDate,
      },
    });
  }

  async deleteProduct(id: string, adminId: string) {
    await this.getProductById(id);
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: adminId },
    });
  }
}
