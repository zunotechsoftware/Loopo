import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';

@Injectable()
export class RbacRepository {
  constructor(private readonly prisma: PrismaService) {}

  // --- Roles CRUD ---
  async createRole(data: { name: string; description?: string; createdBy?: string }) {
    return this.prisma.role.create({
      data,
    });
  }

  async updateRole(id: string, data: { name?: string; description?: string; updatedBy?: string }) {
    return this.prisma.role.update({
      where: { id },
      data,
    });
  }

  async deleteRole(id: string) {
    return this.prisma.role.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findRoleById(id: string) {
    return this.prisma.role.findFirst({
      where: { id, deletedAt: null },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  async findRoleByName(name: string) {
    return this.prisma.role.findFirst({
      where: { name, deletedAt: null },
    });
  }

  async findAllRoles() {
    return this.prisma.role.findMany({
      where: { deletedAt: null },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  // --- Permissions CRUD ---
  async createPermission(data: { name: string; description?: string; createdBy?: string }) {
    return this.prisma.permission.create({
      data,
    });
  }

  async updatePermission(id: string, data: { name?: string; description?: string; updatedBy?: string }) {
    return this.prisma.permission.update({
      where: { id },
      data,
    });
  }

  async deletePermission(id: string) {
    return this.prisma.permission.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findPermissionById(id: string) {
    return this.prisma.permission.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findPermissionByName(name: string) {
    return this.prisma.permission.findFirst({
      where: { name, deletedAt: null },
    });
  }

  async findAllPermissions() {
    return this.prisma.permission.findMany({
      where: { deletedAt: null },
    });
  }

  // --- Role Permissions mappings ---
  async addPermissionToRole(roleId: string, permissionId: string) {
    return this.prisma.rolePermission.create({
      data: { roleId, permissionId },
    });
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    return this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: { roleId, permissionId },
      },
    });
  }

  // --- User Roles assignments ---
  async assignRoleToUser(userId: string, roleId: string, createdBy?: string) {
    return this.prisma.userRole.create({
      data: { userId, roleId, createdBy },
      include: { role: true },
    });
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    return this.prisma.userRole.delete({
      where: {
        userId_roleId: { userId, roleId },
      },
    });
  }

  async findUserRoles(userId: string) {
    return this.prisma.userRole.findMany({
      where: { userId, deletedAt: null },
      include: { role: true },
    });
  }
}
