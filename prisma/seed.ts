import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed Roles
  const roleNames = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'CUSTOMER'];
  const rolesMap = new Map<string, any>();

  for (const name of roleNames) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: {
        name,
        description: `Default role for ${name.toLowerCase()}`,
      },
    });
    rolesMap.set(name, role);
    console.log(`Role ${name} seeded/verified.`);
  }

  // 2. Seed Permissions
  const permissionsList = [
    'users.view',
    'users.create',
    'users.update',
    'users.delete',
    'roles.create',
    'roles.update',
    'roles.delete',
    'categories.manage',
    'products.manage',
    'reports.manage',
    'payments.manage',
    'analytics.view',
    'settings.manage',
    'notifications.manage',
    'kyc.review',
  ];

  const permissionsMap = new Map<string, any>();
  for (const name of permissionsList) {
    const perm = await prisma.permission.upsert({
      where: { name },
      update: {},
      create: {
        name,
        description: `Allows action: ${name}`,
      },
    });
    permissionsMap.set(name, perm);
    console.log(`Permission ${name} seeded/verified.`);
  }

  // 3. Map Permissions to Roles
  const rolePermissions: Record<string, string[]> = {
    SUPER_ADMIN: permissionsList,
    ADMIN: permissionsList,
    MODERATOR: [
      'users.view',
      'categories.manage',
      'products.manage',
      'reports.manage',
      'kyc.review',
      'notifications.manage',
    ],
    CUSTOMER: ['users.view'],
  };

  for (const [roleName, perms] of Object.entries(rolePermissions)) {
    const role = rolesMap.get(roleName);
    if (!role) continue;

    for (const permName of perms) {
      const perm = permissionsMap.get(permName);
      if (!perm) continue;

      // Upsert RolePermission connection
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: perm.id,
        },
      });
    }
    console.log(`Mapped permissions to role ${roleName}.`);
  }

  // 4. Create default Super Admin
  const superAdminEmail = 'superadmin@loopo.com';
  const superAdminRole = rolesMap.get('SUPER_ADMIN');

  if (superAdminRole) {
    const existingUser = await prisma.user.findFirst({
      where: { email: superAdminEmail },
    });

    if (!existingUser) {
      const passwordHash = await bcrypt.hash('Admin@12345', 12);
      const user = await prisma.user.create({
        data: {
          email: superAdminEmail,
          password: passwordHash,
          firstName: 'Super',
          lastName: 'Admin',
          isEmailVerified: true,
          status: 'ACTIVE',
          provider: 'LOCAL',
        },
      });

      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: superAdminRole.id,
        },
      });

      // Also create a profile and notification settings for Super Admin
      await prisma.profile.create({
        data: {
          userId: user.id,
          firstName: 'Super',
          lastName: 'Admin',
          displayName: 'Super Admin',
          email: superAdminEmail,
          status: 'ACTIVE',
          verifiedBadge: true,
          profileCompletionPercentage: 100,
        },
      });

      await prisma.notificationSetting.create({
        data: {
          userId: user.id,
        },
      });

      console.log('Default super admin and its profile created successfully.');
    }
  }

  console.log('Database seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
