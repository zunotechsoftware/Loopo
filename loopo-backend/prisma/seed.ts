import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed Roles
  const roleNames = ['SUPER_ADMIN', 'ADMIN', 'USER'];
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
    'brands.view',
    'brands.create',
    'brands.update',
    'brands.delete',
    'brands.manage',
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
    USER: [
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
      'brands.view',
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
    }).catch(() => { }); // Avoid duplicates on rerun
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
    }).catch(() => { });
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

  // 11. Seed Categories
  const categoryData = [
    { name: 'Mobiles', slug: 'mobiles' },
    { name: 'Vehicles', slug: 'vehicles' },
    { name: 'Home & Living', slug: 'home-and-living' },
    { name: 'Electronics', slug: 'electronics' },
  ];
  const categories: any = {};
  for (const cat of categoryData) {
    categories[cat.name] = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug, isActive: true },
    });
  }

  const subcats = [
    { name: 'iPhone', slug: 'iphone', parentId: categories['Mobiles'].id },
    { name: 'Cars', slug: 'cars', parentId: categories['Vehicles'].id },
    { name: 'Furniture', slug: 'furniture', parentId: categories['Home & Living'].id },
    { name: 'Laptops', slug: 'laptops', parentId: categories['Electronics'].id },
    { name: 'Cameras', slug: 'cameras', parentId: categories['Electronics'].id },
  ];
  for (const sub of subcats) {
    categories[sub.name] = await prisma.category.upsert({
      where: { slug: sub.slug },
      update: {},
      create: { name: sub.name, slug: sub.slug, parentId: sub.parentId, isActive: true },
    });
  }
  console.log('Categories seeded.');

  // 11.5. Seed Brands
  const brandsData = [
    { name: 'Apple', slug: 'apple', category: 'Electronics', country: 'United States', website: 'https://www.apple.com', year: 1976, logo: 'https://logo.clearbit.com/apple.com', featured: true, desc: 'Premium consumer electronics and software' },
    { name: 'Samsung', slug: 'samsung', category: 'Electronics', country: 'South Korea', website: 'https://www.samsung.com', year: 1938, logo: 'https://logo.clearbit.com/samsung.com', featured: true, desc: 'Global leader in electronics and mobile technology' },
    { name: 'Xiaomi', slug: 'xiaomi', category: 'Electronics', country: 'China', website: 'https://www.mi.com', year: 2010, logo: 'https://logo.clearbit.com/mi.com', featured: false, desc: 'Innovative consumer electronics at affordable prices' },
    { name: 'Nike', slug: 'nike', category: 'Mobiles', country: 'United States', website: 'https://www.nike.com', year: 1964, logo: 'https://logo.clearbit.com/nike.com', featured: true, desc: 'World-renowned athletic footwear and apparel' },
    { name: 'Sony', slug: 'sony', category: 'Electronics', country: 'Japan', website: 'https://www.sony.com', year: 1946, logo: 'https://logo.clearbit.com/sony.com', featured: false, desc: 'Entertainment and electronics conglomerate' },
    { name: 'Dell', slug: 'dell', category: 'Electronics', country: 'United States', website: 'https://www.dell.com', year: 1984, logo: 'https://logo.clearbit.com/dell.com', featured: false, desc: 'Leading computer technology company' },
    { name: 'HP', slug: 'hp', category: 'Electronics', country: 'United States', website: 'https://www.hp.com', year: 1939, logo: 'https://logo.clearbit.com/hp.com', featured: false, desc: 'Computing and printing products and services' },
    { name: 'Adidas', slug: 'adidas', category: 'Mobiles', country: 'Germany', website: 'https://www.adidas.com', year: 1949, logo: 'https://logo.clearbit.com/adidas.com', featured: false, desc: 'Athletic and casual sportswear brand' },
    { name: 'Bosch', slug: 'bosch', category: 'Home & Living', country: 'Germany', website: 'https://www.bosch.com', year: 1886, logo: 'https://logo.clearbit.com/bosch.com', featured: false, desc: 'Engineering and technology solutions' },
    { name: 'Canon', slug: 'canon', category: 'Electronics', country: 'Japan', website: 'https://www.canon.com', year: 1937, logo: 'https://logo.clearbit.com/canon.com', featured: false, desc: 'Imaging and optical products specialist' },
  ];

  for (const b of brandsData) {
    const cat = categories[b.category];
    await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: {
        name: b.name,
        slug: b.slug,
        shortDescription: b.desc,
        description: `${b.name} is a globally recognized brand known for quality and innovation. ${b.desc}.`,
        categoryId: cat?.id || null,
        country: b.country,
        website: b.website,
        establishedYear: b.year,
        logoUrl: b.logo,
        isActive: true,
        isFeatured: b.featured,
      },
    });
  }
  console.log('Brands seeded.');

  // 12. Seed Sellers
  const sellersData = [
    { email: 'ajay@example.com', firstName: 'Ajay', lastName: 'Patel', storeName: 'Ajay Electronics', phone: '+91 98765 43210', rating: 4.8, reviews: 128, sales: 876540, verification: 'VERIFIED', listings: 42, kyc: 'APPROVED' },
    { email: 'sneha@example.com', firstName: 'Sneha', lastName: 'Reddy', storeName: 'Reddy Collections', phone: '+91 91234 56789', rating: 4.6, reviews: 95, sales: 543210, verification: 'PENDING', listings: 28, kyc: 'SUBMITTED' },
    { email: 'rahul@example.com', firstName: 'Rahul', lastName: 'Sharma', storeName: 'Sharma Digital', phone: '+91 99887 76655', rating: 4.7, reviews: 182, sales: 1234560, verification: 'VERIFIED', listings: 56, kyc: 'APPROVED' },
    { email: 'vikram@example.com', firstName: 'Vikram', lastName: 'Singh', storeName: 'Vikram Motors', phone: '+91 77665 54433', rating: 4.9, reviews: 210, sales: 1876800, verification: 'VERIFIED', listings: 31, kyc: 'APPROVED' },
  ];
  const sellers: any = {};
  for (const s of sellersData) {
    let user = await prisma.user.findUnique({ where: { email: s.email } });
    if (!user) {
      const p = await bcrypt.hash('Password123', 10);
      user = await prisma.user.create({
        data: {
          email: s.email, phone: s.phone, password: p, firstName: s.firstName, lastName: s.lastName,
          status: 'ACTIVE', provider: 'LOCAL',
          profile: {
            create: {
              firstName: s.firstName, lastName: s.lastName, displayName: `${s.firstName} ${s.lastName}`,
              verifiedBadge: s.verification === 'VERIFIED', phone: s.phone
            }
          },
          sellerProfile: {
            create: {
              displayName: `${s.firstName} ${s.lastName}`,
              storeName: s.storeName,
              verificationStatus: s.verification,
              kycStatus: s.kyc as any,
              sellerRating: s.rating,
              totalSales: s.sales,
              totalListings: s.listings
            }
          },
          sellerStatistics: {
            create: {
              averageRating: s.rating,
              totalReviews: s.reviews
            }
          }
        }
      });
    }
    sellers[s.firstName] = user;
  }
  console.log('Sellers seeded.');

  // 13. Seed Products
  const productsData = [
    { seller: sellers['Ajay'], categoryId: categories['Mobiles'].id, subcategoryId: categories['iPhone'].id, title: 'iPhone 13 128GB Blue', slug: 'iphone-13-128gb-blue', desc: 'Used for 1 year', condition: 'LIKE_NEW', price: 32000, status: 'APPROVED', loc: { city: 'Bangalore', state: 'Karnataka', country: 'India' } },
    { seller: sellers['Sneha'], categoryId: categories['Vehicles'].id, subcategoryId: categories['Cars'].id, title: 'Maruti Swift VXi 2020', slug: 'maruti-swift-vxi-2020', desc: 'Good condition', condition: 'GOOD', price: 485000, status: 'APPROVED', loc: { city: 'Hyderabad', state: 'Telangana', country: 'India' } },
    { seller: sellers['Rahul'], categoryId: categories['Home & Living'].id, subcategoryId: categories['Furniture'].id, title: 'L Shape Sofa Set', slug: 'l-shape-sofa-set', desc: 'Good condition', condition: 'GOOD', price: 18000, status: 'PENDING', loc: { city: 'Pune', state: 'Maharashtra', country: 'India' } },
    { seller: sellers['Vikram'], categoryId: categories['Electronics'].id, subcategoryId: categories['Laptops'].id, title: 'Dell Inspiron 15', slug: 'dell-inspiron-15', desc: 'Like new', condition: 'LIKE_NEW', price: 28500, status: 'APPROVED', loc: { city: 'Delhi', state: 'Delhi', country: 'India' } },
  ];

  for (const pd of productsData) {
    const existingP = await prisma.product.findUnique({ where: { slug: pd.slug } });
    if (!existingP) {
      await prisma.product.create({
        data: {
          sellerId: pd.seller.id, categoryId: pd.categoryId, subcategoryId: pd.subcategoryId,
          title: pd.title, slug: pd.slug, description: pd.desc, condition: pd.condition as any, price: pd.price,
          status: pd.status as any, viewCount: Math.floor(Math.random() * 2000),
          location: {
            create: { city: pd.loc.city, state: pd.loc.state, country: pd.loc.country }
          },
          images: {
            create: { originalUrl: `https://ui-avatars.com/api/?name=${pd.title}&background=random`, sortOrder: 0 }
          }
        }
      });
    }
  }
  console.log('Products seeded.');

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
