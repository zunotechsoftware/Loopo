import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { RedisService } from '../../redis/redis.service';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Check if public route
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // 2. Check if route has permissions metadata
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // 3. Extract user from request
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.roles || !Array.isArray(user.roles)) {
      return false;
    }

    // SUPER_ADMIN bypasses all permission checks
    if (user.roles.includes('SUPER_ADMIN')) {
      return true;
    }

    // 4. Resolve all permissions for the user's roles
    const userPermissions = new Set<string>();

    for (const roleName of user.roles) {
      const cacheKey = `role:permissions:${roleName}`;
      
      try {
        const cached = await this.redisService.get(cacheKey);
        if (cached) {
          const cachedPerms: string[] = JSON.parse(cached);
          cachedPerms.forEach((p) => userPermissions.add(p));
          continue;
        }
      } catch (cacheErr) {
        console.error(`Redis error fetching permissions for ${roleName}:`, cacheErr);
      }

      // Cache miss: query database
      const dbRolePermissions = await this.prisma.rolePermission.findMany({
        where: {
          role: { name: roleName },
          deletedAt: null,
        },
        include: {
          permission: true,
        },
      });

      const perms = dbRolePermissions
        .map((rp) => rp.permission?.name)
        .filter(Boolean) as string[];

      perms.forEach((p) => userPermissions.add(p));

      // Save to cache
      try {
        await this.redisService.set(cacheKey, JSON.stringify(perms), 3600); // 1 hour TTL
      } catch (cacheErr) {
        console.error(`Redis error setting permissions for ${roleName}:`, cacheErr);
      }
    }

    // 5. Evaluate requirements
    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.has(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
