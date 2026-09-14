import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/admin-role.dto';

// The 3 roles this app actually seeds and depends on structurally
// (SUPER_ADMIN bypasses every permission check outright; ADMIN/USER are
// referenced by name in various places). Protected from rename/delete/
// permission-editing through this API to prevent an admin from locking
// themselves (or everyone) out, or deleting a role real users still hold.
const PROTECTED_ROLES = ['SUPER_ADMIN', 'ADMIN', 'USER'];

@Injectable()
export class AdminRolesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllRoles() {
    const roles = await this.prisma.role.findMany({
      where: { deletedAt: null },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: { where: { deletedAt: null } } } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return roles.map((r) => this.serializeRole(r));
  }

  async getAllPermissions() {
    return this.prisma.permission.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async createRole(adminId: string, dto: CreateRoleDto) {
    const existing = await this.prisma.role.findUnique({ where: { name: dto.name } });
    if (existing) {
      throw new BadRequestException(`A role named "${dto.name}" already exists`);
    }

    const permissionIds = await this.resolvePermissionIds(dto.permissionNames || []);

    const role = await this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
        createdBy: adminId,
        permissions: {
          create: permissionIds.map((permissionId) => ({ permissionId, createdBy: adminId })),
        },
      },
      include: { permissions: { include: { permission: true } } },
    });
    return this.serializeRole(role);
  }

  async updateRole(adminId: string, id: string, dto: UpdateRoleDto) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role || role.deletedAt) throw new NotFoundException('Role not found');

    const isProtected = PROTECTED_ROLES.includes(role.name);
    if (isProtected && dto.permissionNames !== undefined) {
      throw new ForbiddenException(`The ${role.name} role's permissions are protected and cannot be changed through this API`);
    }
    if (isProtected && dto.name !== undefined && dto.name !== role.name) {
      throw new ForbiddenException(`The ${role.name} role cannot be renamed`);
    }

    if (dto.name && dto.name !== role.name) {
      const clash = await this.prisma.role.findUnique({ where: { name: dto.name } });
      if (clash) throw new BadRequestException(`A role named "${dto.name}" already exists`);
    }

    await this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        updatedBy: adminId,
      },
    });

    if (dto.permissionNames !== undefined) {
      const permissionIds = await this.resolvePermissionIds(dto.permissionNames);
      await this.prisma.$transaction([
        this.prisma.rolePermission.deleteMany({ where: { roleId: id } }),
        this.prisma.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({ roleId: id, permissionId, createdBy: adminId })),
        }),
      ]);
    }

    const updated = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: { where: { deletedAt: null } } } },
      },
    });
    return this.serializeRole(updated!);
  }

  async deleteRole(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: { where: { deletedAt: null } } } } },
    });
    if (!role || role.deletedAt) throw new NotFoundException('Role not found');

    if (PROTECTED_ROLES.includes(role.name)) {
      throw new ForbiddenException(`The ${role.name} role is a core system role and cannot be deleted`);
    }
    if (role._count.users > 0) {
      throw new BadRequestException(`Cannot delete role "${role.name}" - ${role._count.users} user(s) are still assigned to it`);
    }

    await this.prisma.role.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true };
  }

  private async resolvePermissionIds(names: string[]): Promise<string[]> {
    if (names.length === 0) return [];
    const perms = await this.prisma.permission.findMany({ where: { name: { in: names }, deletedAt: null } });
    const found = new Set(perms.map((p) => p.name));
    const missing = names.filter((n) => !found.has(n));
    if (missing.length > 0) {
      throw new BadRequestException(`Unknown permission(s): ${missing.join(', ')}`);
    }
    return perms.map((p) => p.id);
  }

  private serializeRole(role: any) {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isProtected: PROTECTED_ROLES.includes(role.name),
      userCount: role._count?.users ?? 0,
      permissions: (role.permissions || []).map((rp: any) => rp.permission.name),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}
