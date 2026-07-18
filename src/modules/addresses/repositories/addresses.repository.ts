import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AddressesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.address.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.address.findMany({
      where: { userId, deletedAt: null },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async create(userId: string, data: Prisma.AddressCreateWithoutUserInput) {
    return this.prisma.address.create({
      data: {
        ...data,
        userId,
        createdBy: userId,
      },
    });
  }

  async update(id: string, data: Prisma.AddressUpdateInput, userId: string) {
    return this.prisma.address.update({
      where: { id },
      data: {
        ...data,
        updatedBy: userId,
      },
    });
  }

  async softDelete(id: string, userId: string) {
    return this.prisma.address.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
      },
    });
  }

  async unsetDefaults(userId: string) {
    return this.prisma.address.updateMany({
      where: { userId, isDefault: true, deletedAt: null },
      data: { isDefault: false },
    });
  }
}
