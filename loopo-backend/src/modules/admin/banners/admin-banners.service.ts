import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { BannerType } from '@prisma/client';

@Injectable()
export class AdminBannersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllBanners(type?: BannerType, isActive?: boolean) {
    const where: any = { deletedAt: null };
    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive;
    
    return this.prisma.banner.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getBannerById(id: string) {
    const banner = await this.prisma.banner.findFirst({
      where: { id, deletedAt: null },
    });
    if (!banner) {
      throw new NotFoundException(`Banner ${id} not found`);
    }
    return banner;
  }

  async createBanner(userId: string, dto: CreateBannerDto) {
    return this.prisma.banner.create({
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  async updateBanner(id: string, userId: string, dto: UpdateBannerDto) {
    await this.getBannerById(id);
    return this.prisma.banner.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        updatedBy: userId,
      },
    });
  }

  async deleteBanner(id: string) {
    await this.getBannerById(id);
    return this.prisma.banner.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
