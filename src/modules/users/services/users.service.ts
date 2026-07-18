import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { Prisma, Provider } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.flattenUserRoles(user);
  }

  async findByEmail(email: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) return null;
    return this.flattenUserRoles(user);
  }

  async findByPhone(phone: string) {
    const user = await this.usersRepository.findByPhone(phone);
    if (!user) return null;
    return this.flattenUserRoles(user);
  }

  async findByProvider(provider: Provider, providerId: string) {
    const user = await this.usersRepository.findByProvider(provider, providerId);
    if (!user) return null;
    return this.flattenUserRoles(user);
  }

  async create(data: Prisma.UserCreateInput, roles: string[] = ['CUSTOMER']) {
    const user = await this.usersRepository.create(data, roles);
    return this.flattenUserRoles(user);
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    const user = await this.usersRepository.update(id, data);
    return this.flattenUserRoles(user);
  }

  async delete(id: string) {
    await this.usersRepository.delete(id);
    return { success: true };
  }

  private flattenUserRoles(user: any) {
    if (!user) return null;
    const roles = user.roles.map((ur: any) => ur.role.name);
    const { roles: _, ...userWithoutRolesRelation } = user;
    return {
      ...userWithoutRolesRelation,
      roles,
    };
  }
}
