import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { UserNotificationsService } from '../../user-notifications/services/user-notifications.service';
import { CreateSavedSearchDto, UpdateSavedSearchDto } from '../dto/saved-search.dto';

interface MatchableProduct {
  id: string;
  title: string;
  categoryId: string;
  sellerId: string;
}

@Injectable()
export class SavedSearchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userNotifications: UserNotificationsService,
  ) {}

  async create(userId: string, dto: CreateSavedSearchDto) {
    return this.prisma.savedSearch.create({
      data: {
        userId,
        query: dto.query,
        categoryId: dto.categoryId,
        city: dto.city,
      },
      include: { category: { select: { id: true, name: true } } },
    });
  }

  async findMine(userId: string) {
    return this.prisma.savedSearch.findMany({
      where: { userId },
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async findOwned(userId: string, id: string) {
    const savedSearch = await this.prisma.savedSearch.findUnique({ where: { id } });
    if (!savedSearch) {
      throw new NotFoundException('Saved search not found');
    }
    if (savedSearch.userId !== userId) {
      throw new ForbiddenException('You can only manage your own saved searches');
    }
    return savedSearch;
  }

  async updateNotifications(userId: string, id: string, dto: UpdateSavedSearchDto) {
    await this.findOwned(userId, id);
    return this.prisma.savedSearch.update({
      where: { id },
      data: { notificationsEnabled: dto.notificationsEnabled },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOwned(userId, id);
    await this.prisma.savedSearch.delete({ where: { id } });
    return { success: true };
  }

  /// Called when a listing goes live (APPROVED) - alerts anyone whose saved
  /// search matches it. Matching is deliberately simple (category + city
  /// equality, case-insensitive title substring for the query) rather than
  /// a full search-relevance engine, since nothing like this existed at all
  /// before (both client apps' "Saved Searches" screens were 100% fake).
  async notifyMatchingSearches(product: MatchableProduct, city?: string | null) {
    const candidates = await this.prisma.savedSearch.findMany({
      where: {
        notificationsEnabled: true,
        OR: [{ categoryId: null }, { categoryId: product.categoryId }],
      },
    });

    const titleLower = product.title.toLowerCase();
    const matchedUserIds = candidates
      .filter((s) => {
        if (s.userId === product.sellerId) return false;
        if (s.city && s.city.toLowerCase() !== (city || '').toLowerCase()) return false;
        const queryLower = s.query.trim().toLowerCase();
        return !queryLower || titleLower.includes(queryLower);
      })
      .map((s) => s.userId);

    if (matchedUserIds.length === 0) return 0;

    return this.userNotifications.notifyUsers(matchedUserIds, {
      type: 'SAVED_SEARCH_MATCH',
      title: 'New listing matches your saved search',
      message: `"${product.title}" was just listed and matches one of your saved searches.`,
      link: `/listing/${product.id}`,
      metadata: { productId: product.id },
    });
  }
}
