import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { KycStatus, Prisma } from '@prisma/client';

@Injectable()
export class KycRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.kycDocument.findFirst({
      where: { id, deletedAt: null },
      include: {
        frontImage: true,
        backImage: true,
        selfieImage: true,
        user: {
          include: {
            profile: true,
            kycDocuments: {
              where: { deletedAt: null },
              include: {
                frontImage: true,
                backImage: true,
                selfieImage: true,
              },
            },
          },
        },
      },
    });
  }

  async findLatestByUserId(userId: string) {
    return this.prisma.kycDocument.findFirst({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        frontImage: true,
        backImage: true,
        selfieImage: true,
      },
    });
  }

  async create(userId: string, data: any) {
    return this.prisma.kycDocument.create({
      data: {
        ...data,
        // Mixing nested relation `connect` syntax (frontImage/selfieImage)
        // with a raw `userId` scalar forces Prisma's "checked" input type,
        // which rejects the scalar and demands `user: { connect }` instead.
        user: { connect: { id: userId } },
        createdBy: userId,
      },
      include: {
        frontImage: true,
        backImage: true,
        selfieImage: true,
        user: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  async update(id: string, data: any, userId: string) {
    return this.prisma.kycDocument.update({
      where: { id },
      data: {
        ...data,
        updatedBy: userId,
      },
      include: {
        frontImage: true,
        backImage: true,
        selfieImage: true,
        user: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    status?: KycStatus;
  }) {
    const where: any = { deletedAt: null };
    if (params.status) {
      where.status = params.status;
    }

    return this.prisma.kycDocument.findMany({
      skip: params.skip,
      take: params.take,
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        frontImage: true,
        backImage: true,
        selfieImage: true,
        user: {
          include: {
            profile: true,
          },
        },
      },
    });
  }
}
