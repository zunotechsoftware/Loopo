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
    'categories.view',
    'categories.create',
    'categories.update',
    'categories.delete',
    'categories.manage',
    'products.view',
    'products.create',
    'products.update',
    'products.delete',
    'products.approve',
    'products.reject',
    'products.feature',
    'products.boost',
    'products.manage',
    'reports.manage',
    'reports.view',
    'reports.create',
    'reports.assign',
    'reports.resolve',
    'reports.delete',
    'moderation.manage',
    'users.suspend',
    'users.ban',
    'products.suspend',
    'payments.view',
    'payments.manage',
    'subscriptions.manage',
    'coupons.manage',
    'analytics.view',
    'settings.manage',
    'notifications.manage',
    'kyc.review',
    'search.view',
    'favorites.manage',
    'wishlist.manage',
    'chat.view',
    'chat.create',
    'chat.send',
    'chat.delete',
    'reviews.view',
    'reviews.create',
    'reviews.update',
    'reviews.delete',
    'reviews.moderate',
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
      'categories.view',
      'categories.manage',
      'products.view',
      'products.approve',
      'products.reject',
      'products.feature',
      'products.boost',
      'products.manage',
      'reports.manage',
      'reports.view',
      'reports.assign',
      'reports.resolve',
      'moderation.manage',
      'users.suspend',
      'products.suspend',
      'kyc.review',
      'notifications.manage',
      'search.view',
      'favorites.manage',
      'wishlist.manage',
      'reviews.view',
      'reviews.moderate',
    ],
    CUSTOMER: [
      'users.view',
      'categories.view',
      'products.view',
      'products.create',
      'products.update',
      'products.delete',
      'search.view',
      'favorites.manage',
      'wishlist.manage',
      'chat.view',
      'chat.create',
      'chat.send',
      'chat.delete',
      'payments.view',
      'payments.manage',
      'reports.create',
      'reports.view',
      'reports.delete',
      'reviews.view',
      'reviews.create',
      'reviews.update',
      'reviews.delete',
    ],
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

  // 5. Seed Payment Providers
  const providers = [
    { name: 'Stripe', code: 'STRIPE', isActive: true },
    { name: 'Razorpay', code: 'RAZORPAY', isActive: true },
    { name: 'PayPal', code: 'PAYPAL', isActive: true },
  ];
  for (const provider of providers) {
    await prisma.paymentProvider.upsert({
      where: { code: provider.code },
      update: { isActive: provider.isActive },
      create: provider,
    });
    console.log(`Payment provider ${provider.name} seeded.`);
  }

  // 6. Seed Subscription Plans & Features
  const plans = [
    {
      name: 'Free',
      description: 'Standard free plan for basic sellers',
      price: 0,
      duration: 'MONTHLY',
      features: {
        maxListings: 5,
        featuredListings: 0,
        boostCredits: 0,
        imageLimits: 5,
        videoUpload: false,
        prioritySupport: false,
        analyticsAccess: false,
        chatLimits: 100,
      },
    },
    {
      name: 'Basic',
      description: 'Hobby sellers growing their shopfront',
      price: 499,
      duration: 'MONTHLY',
      features: {
        maxListings: 20,
        featuredListings: 2,
        boostCredits: 1,
        imageLimits: 8,
        videoUpload: false,
        prioritySupport: false,
        analyticsAccess: false,
        chatLimits: 300,
      },
    },
    {
      name: 'Premium',
      description: 'For active and established sellers',
      price: 999,
      duration: 'MONTHLY',
      features: {
        maxListings: 100,
        featuredListings: 10,
        boostCredits: 5,
        imageLimits: 12,
        videoUpload: true,
        prioritySupport: true,
        analyticsAccess: true,
        chatLimits: 1000,
      },
    },
    {
      name: 'Business',
      description: 'For power sellers and small businesses',
      price: 2499,
      duration: 'MONTHLY',
      features: {
        maxListings: 500,
        featuredListings: 50,
        boostCredits: 20,
        imageLimits: 15,
        videoUpload: true,
        prioritySupport: true,
        analyticsAccess: true,
        chatLimits: 5000,
      },
    },
    {
      name: 'Enterprise',
      description: 'Unlimited listings and custom solutions',
      price: 9999,
      duration: 'YEARLY',
      features: {
        maxListings: 99999,
        featuredListings: 999,
        boostCredits: 500,
        imageLimits: 30,
        videoUpload: true,
        prioritySupport: true,
        analyticsAccess: true,
        chatLimits: 99999,
      },
    },
  ];

  for (const planData of plans) {
    const plan = await prisma.subscriptionPlan.upsert({
      where: { name: planData.name },
      update: {
        description: planData.description,
        price: planData.price,
        duration: planData.duration as any,
      },
      create: {
        name: planData.name,
        description: planData.description,
        price: planData.price,
        duration: planData.duration as any,
      },
    });

    await prisma.subscriptionFeature.upsert({
      where: { planId: plan.id },
      update: planData.features,
      create: {
        planId: plan.id,
        ...planData.features,
      },
    });
    console.log(`Subscription plan ${planData.name} and features seeded.`);
  }

  // 7. Seed Featured Packages
  const featuredPackages = [
    { name: 'Homepage Featured', description: 'Highlight listing on homepage grid', price: 299, durationDays: 7, type: 'HOMEPAGE' as any },
    { name: 'Category Featured', description: 'Highlight listing at top of respective category', price: 199, durationDays: 7, type: 'CATEGORY' as any },
    { name: 'Search Featured', description: 'Highlight listing in relevant search results', price: 149, durationDays: 7, type: 'SEARCH' as any },
    { name: 'Featured Badge', description: 'Add eye-catching featured badge on product card', price: 99, durationDays: 15, type: 'BADGE' as any },
  ];

  for (const pkg of featuredPackages) {
    await prisma.featuredPackage.create({
      data: pkg,
    }).catch(() => {}); // Avoid duplicates on rerun
  }
  console.log('Featured packages seeded.');

  // 8. Seed Boost Packages
  const boostPackages = [
    { name: '7 Days Boost', price: 199, durationDays: 7, creditAmount: 1, priorityRanking: 2 },
    { name: '15 Days Boost', price: 349, durationDays: 15, creditAmount: 2, priorityRanking: 3 },
    { name: '30 Days Boost', price: 599, durationDays: 30, creditAmount: 5, priorityRanking: 4 },
  ];

  for (const pkg of boostPackages) {
    await prisma.boostPackage.create({
      data: pkg,
    }).catch(() => {});
  }
  console.log('Boost packages seeded.');

  // 9. Seed Default Verification Coupon
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      name: 'Welcome Coupon 10% Off',
      type: 'PERCENTAGE',
      value: 10,
      minPurchase: 100,
      maxDiscount: 100,
      usageLimit: 1000,
      perUserLimit: 1,
      isActive: true,
    },
  });
  console.log('Coupon WELCOME10 seeded.');

  // 10. Seed Report Reasons
  const reasons = [
    { code: 'SPAM', label: 'Spam / Advertising content' },
    { code: 'FRAUD', label: 'Fraudulent listings or activity' },
    { code: 'FAKE_PRODUCT', label: 'Fake or misrepresented product' },
    { code: 'DUPLICATE_LISTING', label: 'Duplicate product listing' },
    { code: 'WRONG_CATEGORY', label: 'Listing placed in incorrect category' },
    { code: 'COPYRIGHT_VIOLATION', label: 'Copyright, trademark, or intellectual property violation' },
    { code: 'HARASSMENT', label: 'Harassment, hate speech, or abuse' },
    { code: 'ABUSIVE_LANGUAGE', label: 'Inappropriate or vulgar language' },
    { code: 'SCAM', label: 'Suspected scam or suspicious offer' },
    { code: 'ILLEGAL_ITEM', label: 'Sale of prohibited or illegal items' },
    { code: 'COUNTERFEIT', label: 'Counterfeit or replica products' },
    { code: 'OTHER', label: 'Other violation' },
  ];

  for (const reason of reasons) {
    await prisma.reportReason.upsert({
      where: { code: reason.code },
      update: { label: reason.label },
      create: { code: reason.code, label: reason.label },
    });
  }
  console.log('Report reasons seeded.');

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
