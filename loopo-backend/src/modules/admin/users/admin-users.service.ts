import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { UpdateUserStatusDto, UpdateUserRolesDto, CreateAdminUserDto, UpdateAdminUserDto } from './dto/admin-user.dto';
import { UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  // SUPER_ADMIN bypasses every permission check in the app (see
  // PermissionsGuard), so granting it is not an ordinary role assignment -
  // it's handing out unrestricted root access. `roles.update`/
  // `users.update`/`users.create` are real, seeded permissions a plain
  // ADMIN legitimately needs for everyday user management, but none of
  // the three endpoints that can set a user's roles (create, update
  // details, update roles) ever checked what role was being granted vs.
  // who was granting it - confirmed live: a real ADMIN account could
  // PATCH its own roles to ["SUPER_ADMIN"] and successfully gain it.
  private assertCanAssignRoles(requestedRoles: string[], callerRoles: string[]) {
    if (requestedRoles.includes('SUPER_ADMIN') && !callerRoles.includes('SUPER_ADMIN')) {
      throw new ForbiddenException('Only a Super Admin can grant the Super Admin role.');
    }
  }

  async getAllUsers(skip: number = 0, take: number = 20, search?: string, role?: string, status?: string) {
    const where: any = { deletedAt: null };
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (status) {
      where.status = status as UserStatus;
    }

    if (role) {
      where.roles = {
        some: {
          role: { name: role }
        }
      };
    }
    
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        include: { roles: { include: { role: true } }, profile: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where })
    ]);

    return { data, total };
  }

  async createUser(adminId: string, dto: CreateAdminUserDto, callerRoles: string[]) {
    this.assertCanAssignRoles(dto.roles, callerRoles);
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('A user with this email already exists.');
    }

    if (dto.phone) {
      const existingPhone = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
      if (existingPhone) {
        throw new ConflictException('A user with this phone number already exists.');
      }
    }

    const roles = await this.prisma.role.findMany({
      where: { name: { in: dto.roles } },
    });
    if (roles.length !== dto.roles.length) {
      throw new BadRequestException('One or more roles are invalid');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        password: hashedPassword,
        status: UserStatus.ACTIVE,
        provider: 'LOCAL',
        isEmailVerified: true,
        createdBy: adminId,
        roles: {
          create: roles.map(r => ({
            roleId: r.id,
            createdBy: adminId
          }))
        }
      },
    });
    
    return this.getUserById(user.id);
  }

  async updateUserDetails(id: string, adminId: string, dto: UpdateAdminUserDto, callerRoles: string[]) {
    const user = await this.getUserById(id);

    if (dto.email && dto.email !== user.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existing) throw new ConflictException('Email is already in use by another account.');
    }

    if (dto.phone && dto.phone !== user.phone) {
      const existingPhone = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
      if (existingPhone) throw new ConflictException('Phone number is already in use by another account.');
    }

    const data: any = {};
    if (dto.email) data.email = dto.email;
    if (dto.firstName) data.firstName = dto.firstName;
    if (dto.lastName) data.lastName = dto.lastName;
    if (dto.phone) data.phone = dto.phone;
    data.updatedBy = adminId;

    await this.prisma.user.update({
      where: { id },
      data,
    });

    if (dto.roles) {
      await this.updateUserRoles(id, adminId, { roles: dto.roles }, callerRoles);
    }

    return this.getUserById(id);
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        roles: { include: { role: true } },
        kycDocuments: true,
        sellerStatistics: true,
      },
    });

    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async updateUserStatus(id: string, adminId: string, dto: UpdateUserStatusDto) {
    await this.getUserById(id);
    return this.prisma.user.update({
      where: { id },
      data: {
        status: dto.status,
        updatedBy: adminId,
        ...(dto.status === 'DELETED' ? { deletedAt: new Date() } : { deletedAt: null }),
      },
    });
  }

  async updateUserRoles(id: string, adminId: string, dto: UpdateUserRolesDto, callerRoles: string[]) {
    this.assertCanAssignRoles(dto.roles, callerRoles);
    await this.getUserById(id);

    // Get role IDs
    const roles = await this.prisma.role.findMany({
      where: { name: { in: dto.roles } },
    });

    if (roles.length !== dto.roles.length) {
      throw new BadRequestException('One or more roles are invalid');
    }

    // Delete existing
    await this.prisma.userRole.deleteMany({
      where: { userId: id },
    });

    // Create new
    await this.prisma.userRole.createMany({
      data: roles.map((r) => ({
        userId: id,
        roleId: r.id,
        createdBy: adminId,
      })),
    });

    return this.getUserById(id); // Return updated user
  }
}
