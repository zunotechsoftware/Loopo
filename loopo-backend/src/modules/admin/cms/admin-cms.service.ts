import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { RedisService } from '../../../shared/redis/redis.service';
import { CreateCmsPageDto, UpdateCmsPageDto } from './dto/cms-page.dto';

@Injectable()
export class AdminCmsService {
  private readonly CACHE_KEY_PREFIX = 'cms_page:';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async getAllPages() {
    return this.prisma.cmsPage.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPageById(id: string) {
    const page = await this.prisma.cmsPage.findFirst({
      where: { id, deletedAt: null },
    });
    if (!page) {
      throw new NotFoundException(`CMS Page ${id} not found`);
    }
    return page;
  }

  async createPage(userId: string, dto: CreateCmsPageDto) {
    const existing = await this.prisma.cmsPage.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException(`Page with slug ${dto.slug} already exists`);
    }

    return this.prisma.cmsPage.create({
      data: {
        ...dto,
        publishedAt: dto.isPublished ? new Date() : undefined,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  async updatePage(id: string, userId: string, dto: UpdateCmsPageDto) {
    const page = await this.getPageById(id);

    if (dto.slug && dto.slug !== page.slug) {
      const existing = await this.prisma.cmsPage.findUnique({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException(`Page with slug ${dto.slug} already exists`);
      }
    }

    const updated = await this.prisma.cmsPage.update({
      where: { id },
      data: {
        ...dto,
        publishedAt: dto.isPublished && !page.isPublished ? new Date() : undefined,
        updatedBy: userId,
      },
    });

    await this.redisService.del(`${this.CACHE_KEY_PREFIX}${updated.slug}`);
    return updated;
  }

  async deletePage(id: string) {
    const page = await this.getPageById(id);
    
    await this.prisma.cmsPage.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.redisService.del(`${this.CACHE_KEY_PREFIX}${page.slug}`);
    return { success: true };
  }
}
