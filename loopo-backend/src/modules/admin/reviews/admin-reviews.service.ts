import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { UpdateReviewVisibilityDto } from './dto/admin-review.dto';
import { ReviewType } from '@prisma/client';

@Injectable()
export class AdminReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllReviews(skip: number = 0, take: number = 20, type?: ReviewType) {
    const where: any = { deletedAt: null };
    if (type) where.reviewType = type;
    
    return this.prisma.review.findMany({
      where,
      skip,
      take,
      include: {
        reviewer: { select: { id: true, firstName: true, lastName: true, email: true } },
        targetUser: { select: { id: true, firstName: true, lastName: true } },
        product: { select: { id: true, title: true } },
        ratings: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReviewById(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        reviewer: true,
        targetUser: true,
        product: true,
        ratings: true,
        reactions: true,
      },
    });

    if (!review) throw new NotFoundException(`Review ${id} not found`);
    return review;
  }

  async updateReviewVisibility(id: string, dto: UpdateReviewVisibilityDto) {
    await this.getReviewById(id);
    return this.prisma.review.update({
      where: { id },
      data: { isVisible: dto.isVisible },
    });
  }

  async deleteReview(id: string) {
    await this.getReviewById(id);
    return this.prisma.review.update({
      where: { id },
      data: { deletedAt: new Date(), isVisible: false },
    });
  }
}
