import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { CreateWishlistDto, UpdateWishlistDto } from '../dto/interaction.dto';

@Injectable()
export class InteractionsService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Favorites management ---

  async addFavorite(userId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundException(`Listing with ID ${productId} not found`);
    }

    // Attempt unique insert
    try {
      await this.prisma.favorite.create({
        data: { userId, productId },
      });
    } catch {
      // Already favorited
      return { success: true, message: 'Listing is already in your favorites' };
    }

    // Increment favorite counters in transaction
    await this.prisma.$transaction([
      this.prisma.product.update({
        where: { id: productId },
        data: { favoriteCount: { increment: 1 } },
      }),
      this.prisma.productStatistics.upsert({
        where: { productId },
        update: { favoritesCount: { increment: 1 } },
        create: { productId, favoritesCount: 1 },
      }),
    ]);

    return { success: true };
  }

  async removeFavorite(userId: string, productId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (!existing) {
      return { success: true }; // idempotent
    }

    await this.prisma.favorite.delete({
      where: {
        userId_productId: { userId, productId },
      },
    });

    // Decrement counters
    await this.prisma.$transaction([
      this.prisma.product.update({
        where: { id: productId },
        data: { favoriteCount: { decrement: 1 } },
      }),
      this.prisma.productStatistics.update({
        where: { productId },
        data: { favoritesCount: { decrement: 1 } },
      }),
    ]);

    return { success: true };
  }

  async getFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            location: true,
            images: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- Wishlist management ---

  async getWishlists(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { userId, deletedAt: null },
      include: {
        items: {
          include: {
            product: {
              include: {
                location: true,
                images: { orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
      },
    });
  }

  async createWishlist(userId: string, dto: CreateWishlistDto) {
    return this.prisma.$transaction(async (tx) => {
      // If default is requested, unset other default wishlists
      if (dto.isDefault) {
        await tx.wishlist.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.wishlist.create({
        data: {
          userId,
          name: dto.name,
          isDefault: dto.isDefault !== undefined ? dto.isDefault : false,
        },
      });
    });
  }

  async updateWishlist(userId: string, id: string, dto: UpdateWishlistDto) {
    const wishlist = await this.prisma.wishlist.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!wishlist) {
      throw new NotFoundException(`Wishlist with ID ${id} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.wishlist.updateMany({
          where: { userId, isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }

      return tx.wishlist.update({
        where: { id },
        data: {
          name: dto.name,
          isDefault: dto.isDefault,
        },
      });
    });
  }

  async deleteWishlist(userId: string, id: string) {
    const wishlist = await this.prisma.wishlist.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!wishlist) {
      throw new NotFoundException(`Wishlist with ID ${id} not found`);
    }

    if (wishlist.isDefault) {
      throw new BadRequestException('Cannot delete the default wishlist');
    }

    await this.prisma.wishlist.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { id, success: true };
  }

  async addItemToWishlist(
    userId: string,
    wishlistId: string,
    productId: string,
  ) {
    const wishlist = await this.prisma.wishlist.findFirst({
      where: { id: wishlistId, userId, deletedAt: null },
    });

    if (!wishlist) {
      throw new NotFoundException(`Wishlist with ID ${wishlistId} not found`);
    }

    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundException(`Listing with ID ${productId} not found`);
    }

    try {
      await this.prisma.wishlistItem.create({
        data: { wishlistId, productId },
      });
    } catch {
      // Item already in wishlist
    }

    return { success: true };
  }

  async removeItemFromWishlist(
    userId: string,
    wishlistId: string,
    productId: string,
  ) {
    const wishlist = await this.prisma.wishlist.findFirst({
      where: { id: wishlistId, userId, deletedAt: null },
    });

    if (!wishlist) {
      throw new NotFoundException(`Wishlist with ID ${wishlistId} not found`);
    }

    await this.prisma.wishlistItem.deleteMany({
      where: { wishlistId, productId },
    });

    return { success: true };
  }

  // --- Recently Viewed ---

  async getRecentlyViewed(userId: string) {
    const list = await this.prisma.recentlyViewed.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            location: true,
            images: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
      orderBy: { viewedAt: 'desc' },
      take: 20, // max history limit
    });
    return list.map((item) => item.product);
  }

  async clearRecentlyViewed(userId: string) {
    await this.prisma.recentlyViewed.deleteMany({
      where: { userId },
    });
    return { success: true };
  }

  async recordRecentlyViewed(userId: string, productId: string) {
    // Record view in DB recently_viewed history list, capped at 20 entries
    try {
      await this.prisma.recentlyViewed.upsert({
        where: {
          userId_productId: { userId, productId },
        },
        update: {
          viewedAt: new Date(),
        },
        create: {
          userId,
          productId,
        },
      });

      // Clear history logs beyond last 20
      const list = await this.prisma.recentlyViewed.findMany({
        where: { userId },
        orderBy: { viewedAt: 'desc' },
      });

      if (list.length > 20) {
        const excessIds = list.slice(20).map((item) => item.id);
        await this.prisma.recentlyViewed.deleteMany({
          where: { id: { in: excessIds } },
        });
      }
    } catch {
      // Avoid failing main transaction on background interaction logging
    }
  }
}
