import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { CreateAdvertisementDto, UpdateAdvertisementDto } from './dto/advertisements.dto';
import { AdType, AdStatus } from '@prisma/client';

@Injectable()
export class AdminAdvertisementsService {
  constructor(private prisma: PrismaService) {}

  async getAllAdvertisements(type?: AdType, status?: AdStatus) {
    const where: any = { deletedAt: null };
    if (type) where.type = type;
    if (status) where.status = status;

    return this.prisma.advertisement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAdvertisementById(id: string) {
    const advertisement = await this.prisma.advertisement.findFirst({
      where: { id, deletedAt: null },
    });

    if (!advertisement) {
      throw new NotFoundException('Advertisement not found');
    }

    return advertisement;
  }

  async createAdvertisement(userId: string, dto: CreateAdvertisementDto) {
    return this.prisma.advertisement.create({
      data: {
        ...dto,
        createdBy: userId,
      },
    });
  }

  async updateAdvertisement(id: string, userId: string, dto: UpdateAdvertisementDto) {
    const advertisement = await this.getAdvertisementById(id);

    return this.prisma.advertisement.update({
      where: { id: advertisement.id },
      data: {
        ...dto,
        updatedBy: userId,
      },
    });
  }

  async deleteAdvertisement(id: string) {
    const advertisement = await this.getAdvertisementById(id);

    return this.prisma.advertisement.update({
      where: { id: advertisement.id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
