import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma, Provider } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        profile: {
          include: {
            profileImage: true,
            coverImage: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        profile: true,
      },
    });
  }

  async findByPhone(phone: string) {
    return this.prisma.user.findFirst({
      where: { phone, deletedAt: null },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        profile: true,
      },
    });
  }

  async findByProvider(provider: Provider, providerId: string) {
    return this.prisma.user.findFirst({
      where: { provider, providerId, deletedAt: null },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        profile: true,
      },
    });
  }

  async create(data: Prisma.UserCreateInput, roleNames: string[] = ['CUSTOMER']) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data,
      });

      // Assign default roles
      for (const roleName of roleNames) {
        const role = await tx.role.findUnique({
          where: { name: roleName },
        });

        if (role) {
          await tx.userRole.create({
            data: {
              userId: user.id,
              roleId: role.id,
              createdBy: user.id,
            },
          });
        }
      }

      // Initialize default empty profile for the user
      await tx.profile.create({
        data: {
          userId: user.id,
          firstName: data.firstName || null,
          lastName: data.lastName || null,
          displayName: data.firstName ? `${data.firstName} ${data.lastName || ''}`.trim() : user.email?.split('@')[0] || 'User',
          email: user.email || null,
          phone: user.phone || null,
          createdBy: user.id,
        },
      });

      // Initialize default notification preferences
      await tx.notificationSetting.create({
        data: {
          userId: user.id,
          createdBy: user.id,
        },
      });

      return tx.user.findUnique({
        where: { id: user.id },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          profile: {
            include: {
              profileImage: true,
              coverImage: true,
            },
          },
        },
      });
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        profile: {
          include: {
            profileImage: true,
            coverImage: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    // Soft delete the user
    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  // --- Profile Operations ---
  async findProfileByUserId(userId: string) {
    return this.prisma.profile.findFirst({
      where: { userId, deletedAt: null },
      include: {
        profileImage: true,
        coverImage: true,
      },
    });
  }

  async updateProfile(userId: string, data: Prisma.ProfileUpdateInput) {
    return this.prisma.profile.update({
      where: { userId },
      data: {
        ...data,
        updatedBy: userId,
      },
      include: {
        profileImage: true,
        coverImage: true,
      },
    });
  }

  // --- MediaFile Operations ---
  async createMediaFile(userId: string, data: Prisma.MediaFileCreateWithoutUserInput) {
    return this.prisma.mediaFile.create({
      data: {
        ...data,
        userId,
        createdBy: userId,
      },
    });
  }

  async findMediaFileById(id: string) {
    return this.prisma.mediaFile.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async updateMediaFile(id: string, data: Prisma.MediaFileUpdateInput, userId: string) {
    return this.prisma.mediaFile.update({
      where: { id },
      data: {
        ...data,
        updatedBy: userId,
      },
    });
  }

  async softDeleteMediaFile(id: string, userId: string) {
    return this.prisma.mediaFile.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
      },
    });
  }
}
