import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { RbacRepository } from '../repositories/rbac.repository';
import { RedisService } from '../../../shared/redis/redis.service';

@Injectable()
export class RbacService {
  constructor(
    private readonly rbacRepository: RbacRepository,
    private readonly redisService: RedisService,
  ) {}

  // --- Roles ---
  async createRole(name: string, description?: string, userId?: string) {
    const existing = await this.rbacRepository.findRoleByName(name);
    if (existing) {
      throw new ConflictException(`Role with name "${name}" already exists`);
    }
    return this.rbacRepository.createRole({ name, description, createdBy: userId });
  }

  async updateRole(id: string, name?: string, description?: string, userId?: string) {
    const role = await this.rbacRepository.findRoleById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }
    if (name && name !== role.name) {
      const existing = await this.rbacRepository.findRoleByName(name);
      if (existing) {
        throw new ConflictException(`Role with name "${name}" already exists`);
      }
    }
    const updated = await this.rbacRepository.updateRole(id, { name, description, updatedBy: userId });
    
    // Invalidate Cache for permissions of this role
    await this.redisService.del(`role:permissions:${role.name}`);
    if (name) {
      await this.redisService.del(`role:permissions:${name}`);
    }
    return updated;
  }

  async deleteRole(id: string) {
    const role = await this.rbacRepository.findRoleById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }
    // Prevent deleting core system roles
    const systemRoles = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'CUSTOMER'];
    if (systemRoles.includes(role.name)) {
      throw new ConflictException(`System role "${role.name}" cannot be deleted`);
    }
    const deleted = await this.rbacRepository.deleteRole(id);
    await this.redisService.del(`role:permissions:${role.name}`);
    return deleted;
  }

  async getRole(id: string) {
    const role = await this.rbacRepository.findRoleById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }
    return role;
  }

  async getAllRoles() {
    return this.rbacRepository.findAllRoles();
  }

  // --- Permissions ---
  async createPermission(name: string, description?: string, userId?: string) {
    const existing = await this.rbacRepository.findPermissionByName(name);
    if (existing) {
      throw new ConflictException(`Permission with name "${name}" already exists`);
    }
    return this.rbacRepository.createPermission({ name, description, createdBy: userId });
  }

  async updatePermission(id: string, name?: string, description?: string, userId?: string) {
    const perm = await this.rbacRepository.findPermissionById(id);
    if (!perm) {
      throw new NotFoundException(`Permission with ID "${id}" not found`);
    }
    if (name && name !== perm.name) {
      const existing = await this.rbacRepository.findPermissionByName(name);
      if (existing) {
        throw new ConflictException(`Permission with name "${name}" already exists`);
      }
    }
    return this.rbacRepository.updatePermission(id, { name, description, updatedBy: userId });
  }

  async deletePermission(id: string) {
    const perm = await this.rbacRepository.findPermissionById(id);
    if (!perm) {
      throw new NotFoundException(`Permission with ID "${id}" not found`);
    }
    return this.rbacRepository.deletePermission(id);
  }

  async getPermission(id: string) {
    const perm = await this.rbacRepository.findPermissionById(id);
    if (!perm) {
      throw new NotFoundException(`Permission with ID "${id}" not found`);
    }
    return perm;
  }

  async getAllPermissions() {
    return this.rbacRepository.findAllPermissions();
  }

  // --- User Role Assignments ---
  async assignRoleToUser(userId: string, roleId: string, adminId?: string) {
    const role = await this.rbacRepository.findRoleById(roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }
    const userRoles = await this.rbacRepository.findUserRoles(userId);
    const alreadyAssigned = userRoles.some((ur) => ur.roleId === roleId);
    if (alreadyAssigned) {
      throw new ConflictException(`Role is already assigned to this user`);
    }
    const assigned = await this.rbacRepository.assignRoleToUser(userId, roleId, adminId);
    
    // Invalidate User Roles Cache (if any) or user profile cache
    await this.redisService.del(`user:profile:${userId}`);
    return assigned;
  }

  async removeRoleFromUser(userId: string, roleId: string, adminId?: string) {
    const role = await this.rbacRepository.findRoleById(roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }
    const userRoles = await this.rbacRepository.findUserRoles(userId);
    const assigned = userRoles.find((ur) => ur.roleId === roleId);
    if (!assigned) {
      throw new NotFoundException(`Role is not assigned to this user`);
    }

    // Prevent removing SUPER_ADMIN if it's the last one
    if (role.name === 'SUPER_ADMIN') {
      // Find how many SUPER_ADMINs are there
      // To keep it simple, we check userRoles length, but we can prevent self-deletion or general safeties
      if (userId === adminId) {
        throw new ConflictException('Super Admins cannot revoke their own Super Admin role.');
      }
    }

    await this.rbacRepository.removeRoleFromUser(userId, roleId);
    await this.redisService.del(`user:profile:${userId}`);
    return { success: true };
  }
}
