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

  // 14. Seed Banners
  const bannersData = [
    { title: 'Mega Sale Banner', type: 'HOMEPAGE', imageUrl: 'https://via.placeholder.com/800x200/4F46E5/FFFFFF?text=MEGA+SALE', targetUrl: '/sale', sortOrder: 1, isActive: true, audience: 'ALL', startDate: new Date(), endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)) },
    { title: 'New Arrivals Banner', type: 'HOMEPAGE', imageUrl: 'https://via.placeholder.com/800x200/10B981/FFFFFF?text=NEW+ARRIVALS', targetUrl: '/new', sortOrder: 2, isActive: true, audience: 'ALL', startDate: new Date(), endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)) },
    { title: 'Electronics Fest', type: 'CATEGORY', imageUrl: 'https://via.placeholder.com/800x200/8B5CF6/FFFFFF?text=ELECTRONICS+FEST', targetUrl: '/category/electronics', sortOrder: 3, isActive: true, audience: 'ALL', startDate: new Date(), endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)) },
    { title: 'Welcome Offer', type: 'POPUP', imageUrl: 'https://via.placeholder.com/400x400/F59E0B/FFFFFF?text=WELCOME+OFFER', targetUrl: '/signup', sortOrder: 4, isActive: true, audience: 'GUEST', startDate: new Date(), endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) },
    { title: 'Clearance Sale', type: 'PROMOTIONAL', imageUrl: 'https://via.placeholder.com/800x200/EC4899/FFFFFF?text=CLEARANCE+SALE', targetUrl: '/clearance', sortOrder: 5, isActive: false, audience: 'ALL', startDate: new Date(new Date().setMonth(new Date().getMonth() - 2)), endDate: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
  ];

  for (const bd of bannersData) {
    const existingB = await prisma.banner.findFirst({ where: { title: bd.title } });
    if (!existingB) {
      await prisma.banner.create({
        data: {
          title: bd.title,
          type: bd.type as any,
          imageUrl: bd.imageUrl,
          targetUrl: bd.targetUrl,
          sortOrder: bd.sortOrder,
          isActive: bd.isActive,
          audience: bd.audience,
          startDate: bd.startDate,
          endDate: bd.endDate
        }
      });
    }
  }
  console.log('Banners seeded.');

  // 15. Seed Advertisements
  const advertisementsData = [
    { title: 'Summer Sale Banner', type: 'BANNER', placement: 'Home Page - Top', campaign: 'Summer Sale 2024', status: 'ACTIVE', imageUrl: 'https://via.placeholder.com/800x200/4F46E5/FFFFFF?text=SUMMER+SALE', targetUrl: '/summer-sale', impressions: 260500, clicks: 12400, spend: 64500, startDate: new Date('2024-05-15'), endDate: new Date('2024-05-31') },
    { title: 'Electronics Fest', type: 'BANNER', placement: 'Category Page', campaign: 'Electronics Fest', status: 'ACTIVE', imageUrl: 'https://via.placeholder.com/800x200/10B981/FFFFFF?text=ELECTRONICS+FEST', targetUrl: '/electronics', impressions: 180200, clicks: 8700, spend: 18500, startDate: new Date('2024-05-05'), endDate: new Date('2024-05-25') },
    { title: 'Mega Discount Ad', type: 'IMAGE_AD', placement: 'Listing Page', campaign: 'Mega Discount', status: 'PAUSED', imageUrl: 'https://via.placeholder.com/400x400/F59E0B/FFFFFF?text=MEGA+DISCOUNT', targetUrl: '/mega-discount', impressions: 85500, clicks: 3200, spend: 8400, startDate: new Date('2024-05-01'), endDate: new Date('2024-05-20') },
    { title: 'Download App Now', type: 'TEXT_AD', placement: 'Sidebar', campaign: 'App Promotion', status: 'ACTIVE', imageUrl: null, targetUrl: '/download', impressions: 120700, clicks: 6600, spend: 11200, startDate: new Date('2024-04-05'), endDate: new Date('2024-05-10') },
    { title: 'Fashion Sale 40% OFF', type: 'BANNER', placement: 'Home Page - Middle', campaign: 'Fashion Sale', status: 'COMPLETED', imageUrl: 'https://via.placeholder.com/800x200/EC4899/FFFFFF?text=FASHION+SALE', targetUrl: '/fashion', impressions: 210300, clicks: 9500, spend: 20400, startDate: new Date('2024-04-15'), endDate: new Date('2024-04-30') },
  ];

  for (const ad of advertisementsData) {
    const existingAd = await prisma.advertisement.findFirst({ where: { title: ad.title } });
    if (!existingAd) {
      await prisma.advertisement.create({
        data: {
          title: ad.title,
          type: ad.type as any,
          placement: ad.placement,
          campaign: ad.campaign,
          status: ad.status as any,
          imageUrl: ad.imageUrl,
          targetUrl: ad.targetUrl,
          impressions: ad.impressions,
          clicks: ad.clicks,
          spend: ad.spend,
          startDate: ad.startDate,
          endDate: ad.endDate
        }
      });
    }
  }
  console.log('Advertisements seeded.');

  // 16. Seed KYC Documents for Venkatesh Sekar
  const venkateshEmail = 'venkatesh@gmail.com';
  let venkUser = await prisma.user.findUnique({
    where: { email: venkateshEmail },
    include: { profile: true, sellerProfile: true },
  });

  if (!venkUser) {
    const passwordHash = await bcrypt.hash('Password123', 10);
    venkUser = await prisma.user.create({
      data: {
        email: venkateshEmail,
        phone: '+91 81234 56789',
        password: passwordHash,
        firstName: 'Venkatesh',
        lastName: 'Sekar',
        status: 'ACTIVE',
        provider: 'LOCAL',
        isEmailVerified: true,
        isPhoneVerified: true,
        profile: {
          create: {
            firstName: 'Venkatesh',
            lastName: 'Sekar',
            displayName: 'Venkatesh Sekar',
            email: venkateshEmail,
            phone: '+91 81234 56789',
            dateOfBirth: new Date('1995-08-15'),
            gender: 'Male',
            country: 'India',
            state: 'Tamil Nadu',
            city: 'Hosur',
            zipCode: '635109',
            status: 'ACTIVE',
            verifiedBadge: false,
          },
        },
        sellerProfile: {
          create: {
            displayName: 'Venkatesh Sekar',
            storeName: 'Venkatesh Store',
            verificationStatus: 'PENDING',
            kycStatus: 'SUBMITTED',
            sellerRating: 0.0,
            totalSales: 0,
            totalListings: 0,
          },
        },
        sellerStatistics: {
          create: {
            averageRating: 0.0,
            totalReviews: 0,
          },
        },
      },
      include: { profile: true, sellerProfile: true },
    });
  }

  // Ensure MediaFiles and KycDocuments exist for Venkatesh Sekar
  const existingKyc = await prisma.kycDocument.findFirst({
    where: { userId: venkUser.id },
  });

  if (!existingKyc) {
    // 1. Create Media Files (use local urls matching our saved files)
    const mediaAadhaarFront = await prisma.mediaFile.create({
      data: {
        userId: venkUser.id,
        fileName: 'aadhaar_front.jpg',
        fileUrl: '/images/aadhaar_front.jpg', // loopo-admin serves images from public/images
        fileSize: 624929,
        mimeType: 'image/jpeg',
        category: 'KYC_FRONT',
        status: 'READY',
      },
    });

    const mediaAadhaarBack = await prisma.mediaFile.create({
      data: {
        userId: venkUser.id,
        fileName: 'aadhaar_back.jpg',
        fileUrl: '/images/aadhaar_back.jpg',
        fileSize: 670382,
        mimeType: 'image/jpeg',
        category: 'KYC_BACK',
        status: 'READY',
      },
    });

    const mediaPanFront = await prisma.mediaFile.create({
      data: {
        userId: venkUser.id,
        fileName: 'pan_front.jpg',
        fileUrl: '/images/pan_card.jpg',
        fileSize: 988234,
        mimeType: 'image/jpeg',
        category: 'KYC_FRONT',
        status: 'READY',
      },
    });

    const mediaSelfie = await prisma.mediaFile.create({
      data: {
        userId: venkUser.id,
        fileName: 'selfie.jpg',
        fileUrl: '/images/selfie.jpg',
        fileSize: 680605,
        mimeType: 'image/jpeg',
        category: 'KYC_SELFIE',
        status: 'READY',
      },
    });

    // 2. Create KYC Documents (Aadhaar & PAN)
    await prisma.kycDocument.create({
      data: {
        userId: venkUser.id,
        documentType: 'AADHAAR',
        documentNumber: '1234 5678 9012',
        frontImageId: mediaAadhaarFront.id,
        backImageId: mediaAadhaarBack.id,
        selfieImageId: mediaSelfie.id,
        status: 'SUBMITTED',
        submittedAt: new Date('2026-08-21T22:42:00Z'),
        remarks: 'KYC Submitted by user',
      },
    });

    await prisma.kycDocument.create({
      data: {
        userId: venkUser.id,
        documentType: 'PAN',
        documentNumber: 'ABCDE1234F',
        frontImageId: mediaPanFront.id,
        selfieImageId: mediaSelfie.id,
        status: 'SUBMITTED',
        submittedAt: new Date('2026-08-21T22:42:00Z'),
      },
    });

    console.log('KycDocuments seeded for Venkatesh Sekar.');
  }

  // --- Seed Support Tickets ---
  console.log('Seeding Support Tickets...');
  const USERS_LIST = [
    { name: 'Rahul Sharma', email: 'rahul.sharma@email.com', phone: '+91 98765 43210' },
    { name: 'Priya Patel', email: 'priya.patel@email.com', phone: '+91 91234 56789' },
    { name: 'Amit Kumar', email: 'amit.kumar@email.com', phone: '+91 88776 65544' },
    { name: 'Sneha Reddy', email: 'sneha.reddy@email.com', phone: '+91 99887 76655' },
    { name: 'Vikram Singh', email: 'vikram.singh@email.com', phone: '+91 97654 32109' },
    { name: 'Neha Verma', email: 'neha.verma@email.com', phone: '+91 96543 21098' },
    { name: 'Arjun Mehta', email: 'arjun.mehta@email.com', phone: '+91 95432 10987' },
    { name: 'Kavya Nair', email: 'kavya.nair@email.com', phone: '+91 94321 09876' },
    { name: 'Rohit Das', email: 'rohit.das@email.com', phone: '+91 93210 98765' },
    { name: 'Ananya Joshi', email: 'ananya.joshi@email.com', phone: '+91 92109 87654' },
    { name: 'Sanjay Gupta', email: 'sanjay.gupta@email.com', phone: '+91 91098 76543' },
    { name: 'Deepa Krishnan', email: 'deepa.k@email.com', phone: '+91 90987 65432' },
    { name: 'Vijay Chawla', email: 'vijay.chawla@email.com', phone: '+91 89876 54321' },
    { name: 'Meera Sen', email: 'meera.sen@email.com', phone: '+91 88765 43210' },
    { name: 'Karthik Raja', email: 'karthik.raja@email.com', phone: '+91 87654 32109' },
    { name: 'Pooja Hegde', email: 'pooja.hegde@email.com', phone: '+91 86543 21098' }
  ];

  const TKT_CATEGORIES = ['Listings', 'Payments', 'Refunds', 'Technical', 'Account', 'Payouts', 'Orders'];
  const TKT_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
  const TKT_STATUSES = ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_USER', 'RESOLVED', 'CLOSED'] as const;
  const TKT_CHANNELS = ['EMAIL', 'CHAT', 'WEB', 'PHONE'] as const;
  const TKT_AGENTS = ['Support Agent A', 'Admin User', 'Support Specialist B', 'Manager C'];

  const TKT_SUBJECTS: Record<string, string[]> = {
    Listings: [
      'Image upload limit exceeded error',
      'Listing rejected without clear reason',
      'Cannot edit active product listing details',
      'Listing description formatting is broken',
      'Item details not showing under Mobiles category'
    ],
    Payments: [
      'Invoice not received for order #ORD-2831',
      'Payment completed but status still Escrow Pending',
      'Bank account verification pending for 3 days',
      'Double debited for subscription boost package',
      'Failed payment message on checkout screen'
    ],
    Refunds: [
      'Refund not processed for canceled order',
      'Canceled booking refund timeline inquiry',
      'Refund transaction reference missing',
      'Wrong refund amount credited to bank card',
      'Dispute refund request for order #ORD-1229'
    ],
    Technical: [
      'Login page loops and doesn\'t redirect',
      'App crashes frequently on camera capture',
      'Push notifications not delivering on Android',
      'Profile image upload throws server error 500',
      'Search bar filter results are unresponsive'
    ],
    Account: [
      'Seller account suspension appeal',
      'Reset password verification email not received',
      'Update profile mobile number request',
      'Verify business tax registration document',
      'Close account and delete user profile data'
    ],
    Payouts: [
      'Seller payout delayed for completed orders',
      'Payout bank details update failing',
      'Commission fee structure question',
      'Missing payout settlement statement for May',
      'Minimum payout threshold limits check'
    ],
    Orders: [
      'Item received is not as described in listing',
      'Courier partner tracking status update request',
      'Cancel order request for #ORD-12932',
      'Delivery address incorrect after order confirmation',
      'Buyer claims package not received but marked delivered'
    ]
  };

  for (let i = 0; i < 150; i++) {
    const idNum = 1254 - i;
    const ticketNumber = `TKT-000${idNum}`;
    const user = USERS_LIST[i % USERS_LIST.length];
    const category = TKT_CATEGORIES[i % TKT_CATEGORIES.length];
    const subjects = TKT_SUBJECTS[category] || TKT_SUBJECTS['Payments'];
    const subject = subjects[i % subjects.length];
    const priority = TKT_PRIORITIES[i % TKT_PRIORITIES.length];
    const status = TKT_STATUSES[i % TKT_STATUSES.length];
    const channel = TKT_CHANNELS[i % TKT_CHANNELS.length];
    const assignedAgent = TKT_AGENTS[i % TKT_AGENTS.length];

    const day = Math.max(1, 12 - Math.floor(i / 13));
    const hour = (10 + (i * 7)) % 12 || 12;
    const min = (15 + (i * 9)) % 60;
    const createdDate = new Date(2024, 4, day, hour, min);

    const existingTicket = await prisma.supportTicket.findUnique({
      where: { ticketNumber }
    });

    if (!existingTicket) {
      await prisma.supportTicket.create({
        data: {
          ticketNumber,
          userName: user.name,
          userEmail: user.email,
          userPhone: user.phone,
          subject,
          category,
          priority,
          status,
          channel,
          assignedAgent,
          relatedOrderId: `#ORD-${12450 - i}`,
          relatedProductName: `${category} Order - Item #${100 + i}`,
          relatedAmount: `₹${((i % 10) + 1) * 3500 + 999}`,
          relatedOrderStatus: status === 'RESOLVED' || status === 'CLOSED' ? 'Payment Completed' : 'Escrow Pending',
          createdAt: createdDate,
          updatedAt: createdDate,
          lastReplyAt: createdDate,
          messages: {
            create: [
              {
                senderType: 'USER',
                senderName: user.name,
                message: `Hello support team, I am reaching out regarding: "${subject}". Can you please assist me with this request as soon as possible?`,
                createdAt: createdDate,
                attachments: i % 2 === 0 ? [{ name: 'error_screenshot.png', url: '/images/aadhaar_front.jpg', size: '245 KB' }] : undefined
              }
            ]
          },
          internalNotes: {
            create: [
              {
                authorName: 'System Audit',
                note: `Ticket verified. Customer profile matches records. Assigned to ${assignedAgent}.`,
                createdAt: createdDate
              }
            ]
          },
          activityLogs: {
            create: [
              {
                operator: user.name,
                action: `Support ticket submitted by user via ${channel}`,
                createdAt: createdDate
              },
              {
                operator: 'System Router',
                action: `Ticket auto-assigned to ${assignedAgent}`,
                createdAt: createdDate
              }
            ]
          }
        }
      });
    }
  }
  console.log('150 Support Tickets seeded to PostgreSQL database.');

  // --- Seed Complaints ---
  console.log('Seeding Complaints...');
  const COMPLAINT_CATEGORIES = ['Orders', 'Payments', 'Refunds', 'Technical', 'Account', 'Sellers', 'Delivery'];
  const COMPLAINT_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
  const COMPLAINT_SEVERITIES = ['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL'] as const;
  const COMPLAINT_STATUSES = ['SUBMITTED', 'ASSIGNED', 'INVESTIGATING', 'ACTION_REQUIRED', 'RESOLVED', 'CLOSED'] as const;
  const COMPLAINT_CHANNELS = ['EMAIL', 'CHAT', 'WEB', 'PHONE'] as const;
  const COMPLAINT_DEPARTMENTS = ['Support', 'Billing', 'Fraud & Safety', 'Logistics', 'Seller Relations', 'Technical'];
  const COMPLAINT_VENDORS = ['TechZone Electronics', 'UrbanStyle Fashion', 'ElectroWorld Hub', 'MobileHub Store', 'Loopo Official', 'LensCraft Pro', 'Express Logistics', 'GadgetCare India', 'Vogue Apparel'];

  const SPECIFIC_COMPLAINTS = [
    {
      complaintNumber: 'CMP-0001248',
      userName: 'Rahul Sharma',
      userEmail: 'rahul.sharma@email.com',
      userPhone: '+91 98765 43210',
      subjectTitle: 'Item not as described',
      subjectDescription: 'The product I received is completely different from what was shown in the listing pictures. The color is wrong and it has scratches on the back cover.',
      category: 'Orders',
      priority: 'HIGH' as const,
      severity: 'MAJOR' as const,
      status: 'SUBMITTED' as const,
      channel: 'EMAIL' as const,
      vendorName: 'TechZone Electronics',
      relatedOrderId: '#ORD-9821',
      relatedAmount: '₹24,999',
      relatedOrderStatus: 'Delivered',
      createdDate: new Date('2024-05-12T10:31:00Z'),
      updatedDate: new Date('2024-05-12T10:31:00Z')
    },
    {
      complaintNumber: 'CMP-0001247',
      userName: 'Priya Patel',
      userEmail: 'priya.patel@email.com',
      userPhone: '+91 91234 56789',
      subjectTitle: 'Payment issue',
      subjectDescription: 'Payment was deducted from my bank account but order status is still showing Pending. Transaction reference #TXN-881921.',
      category: 'Payments',
      priority: 'HIGH' as const,
      severity: 'MAJOR' as const,
      status: 'INVESTIGATING' as const,
      channel: 'CHAT' as const,
      vendorName: 'UrbanStyle Fashion',
      relatedOrderId: '#ORD-9820',
      relatedAmount: '₹3,499',
      relatedOrderStatus: 'Payment Verification',
      createdDate: new Date('2024-05-12T09:15:00Z'),
      updatedDate: new Date('2024-05-12T11:20:00Z')
    },
    {
      complaintNumber: 'CMP-0001246',
      userName: 'Amit Kumar',
      userEmail: 'amit.kumar@email.com',
      userPhone: '+91 88776 65544',
      subjectTitle: 'Refund not received',
      subjectDescription: 'I requested a refund but have not received it after 7 business days. Gateway stated refund was issued on May 4.',
      category: 'Refunds',
      priority: 'MEDIUM' as const,
      severity: 'MODERATE' as const,
      status: 'ACTION_REQUIRED' as const,
      channel: 'WEB' as const,
      vendorName: 'ElectroWorld Hub',
      relatedOrderId: '#ORD-9818',
      relatedAmount: '₹8,200',
      relatedOrderStatus: 'Refund Requested',
      createdDate: new Date('2024-05-11T20:45:00Z'),
      updatedDate: new Date('2024-05-11T21:50:00Z')
    },
    {
      complaintNumber: 'CMP-0001245',
      userName: 'Sneha Reddy',
      userEmail: 'sneha.reddy@email.com',
      userPhone: '+91 99887 76655',
      subjectTitle: 'Unable to upload images',
      subjectDescription: 'I am unable to upload supporting images when disputing an item condition. The file upload button throws a network error.',
      category: 'Technical',
      priority: 'MEDIUM' as const,
      severity: 'MINOR' as const,
      status: 'SUBMITTED' as const,
      channel: 'EMAIL' as const,
      vendorName: 'MobileHub Store',
      relatedOrderId: '#ORD-9815',
      relatedAmount: '₹12,450',
      relatedOrderStatus: 'Delivered',
      createdDate: new Date('2024-05-11T18:20:00Z'),
      updatedDate: new Date('2024-05-11T18:20:00Z')
    },
    {
      complaintNumber: 'CMP-0001244',
      userName: 'Vikram Singh',
      userEmail: 'vikram.singh@email.com',
      userPhone: '+91 97654 32109',
      subjectTitle: 'Account verification issue',
      subjectDescription: 'My account is under review for more than 5 days. All Aadhaar and PAN documents were submitted properly.',
      category: 'Account',
      priority: 'LOW' as const,
      severity: 'MINOR' as const,
      status: 'RESOLVED' as const,
      channel: 'PHONE' as const,
      vendorName: 'Loopo Official',
      relatedOrderId: '#ORD-9810',
      relatedAmount: '₹0',
      relatedOrderStatus: 'Completed',
      createdDate: new Date('2024-05-10T16:30:00Z'),
      updatedDate: new Date('2024-05-11T10:15:00Z')
    },
    {
      complaintNumber: 'CMP-0001243',
      userName: 'Neha Verma',
      userEmail: 'neha.verma@email.com',
      userPhone: '+91 96543 21098',
      subjectTitle: 'Login problems',
      subjectDescription: 'I can\'t login to my account on mobile app after password reset. SMS OTP arrives delayed by 10 minutes.',
      category: 'Technical',
      priority: 'HIGH' as const,
      severity: 'MODERATE' as const,
      status: 'RESOLVED' as const,
      channel: 'CHAT' as const,
      vendorName: 'Loopo Official',
      relatedOrderId: '#ORD-9807',
      relatedAmount: '₹0',
      relatedOrderStatus: 'Completed',
      createdDate: new Date('2024-05-10T14:30:00Z'),
      updatedDate: new Date('2024-05-10T17:40:00Z')
    },
    {
      complaintNumber: 'CMP-0001242',
      userName: 'Arjun Mehta',
      userEmail: 'arjun.mehta@email.com',
      userPhone: '+91 95432 10987',
      subjectTitle: 'Seller not responding',
      subjectDescription: 'The seller is not replying to messages regarding the warranty certificate and invoice for the camera lens.',
      category: 'Sellers',
      priority: 'MEDIUM' as const,
      severity: 'MODERATE' as const,
      status: 'ASSIGNED' as const,
      channel: 'EMAIL' as const,
      vendorName: 'LensCraft Pro',
      relatedOrderId: '#ORD-9801',
      relatedAmount: '₹45,000',
      relatedOrderStatus: 'Delivered',
      createdDate: new Date('2024-05-09T11:20:00Z'),
      updatedDate: new Date('2024-05-09T11:20:00Z')
    },
    {
      complaintNumber: 'CMP-0001241',
      userName: 'Kavya Nair',
      userEmail: 'kavya.nair@email.com',
      userPhone: '+91 94321 09876',
      subjectTitle: 'Delivery delayed',
      subjectDescription: 'My order is delayed by more than 4 days past the scheduled delivery window without any courier update.',
      category: 'Delivery',
      priority: 'LOW' as const,
      severity: 'MINOR' as const,
      status: 'RESOLVED' as const,
      channel: 'WEB' as const,
      vendorName: 'Express Logistics',
      relatedOrderId: '#ORD-9795',
      relatedAmount: '₹1,850',
      relatedOrderStatus: 'In Transit',
      createdDate: new Date('2024-05-09T10:00:00Z'),
      updatedDate: new Date('2024-05-09T15:15:00Z')
    },
    {
      complaintNumber: 'CMP-0001240',
      userName: 'Rohit Das',
      userEmail: 'rohit.das@email.com',
      userPhone: '+91 93210 98765',
      subjectTitle: 'Damaged item received',
      subjectDescription: 'I received a damaged item with broken screen glass. Box was torn during transit. Requested replacement.',
      category: 'Orders',
      priority: 'HIGH' as const,
      severity: 'CRITICAL' as const,
      status: 'CLOSED' as const,
      channel: 'EMAIL' as const,
      vendorName: 'GadgetCare India',
      relatedOrderId: '#ORD-9788',
      relatedAmount: '₹18,900',
      relatedOrderStatus: 'Replaced & Closed',
      createdDate: new Date('2024-05-08T19:15:00Z'),
      updatedDate: new Date('2024-05-09T19:45:00Z')
    },
    {
      complaintNumber: 'CMP-0001239',
      userName: 'Ananya Joshi',
      userEmail: 'ananya.joshi@email.com',
      userPhone: '+91 92109 87654',
      subjectTitle: 'Wrong item delivered',
      subjectDescription: 'I received a different item (size S instead of L) from what I ordered. Need return pickup scheduled.',
      category: 'Orders',
      priority: 'MEDIUM' as const,
      severity: 'MODERATE' as const,
      status: 'CLOSED' as const,
      channel: 'CHAT' as const,
      vendorName: 'Vogue Apparel',
      relatedOrderId: '#ORD-9780',
      relatedAmount: '₹2,200',
      relatedOrderStatus: 'Return Completed',
      createdDate: new Date('2024-05-08T17:45:00Z'),
      updatedDate: new Date('2024-05-08T20:30:00Z')
    }
  ];

  // Seed top 10 specific complaints
  for (const c of SPECIFIC_COMPLAINTS) {
    const existing = await prisma.complaint.findUnique({ where: { complaintNumber: c.complaintNumber } });
    if (!existing) {
      await prisma.complaint.create({
        data: {
          complaintNumber: c.complaintNumber,
          userName: c.userName,
          userEmail: c.userEmail,
          userPhone: c.userPhone,
          vendorName: c.vendorName,
          relatedOrderId: c.relatedOrderId,
          relatedAmount: c.relatedAmount,
          relatedOrderStatus: c.relatedOrderStatus,
          subjectTitle: c.subjectTitle,
          subjectDescription: c.subjectDescription,
          category: c.category,
          priority: c.priority,
          severity: c.severity,
          status: c.status,
          channel: c.channel,
          assignedDepartment: 'Support',
          assignedAgent: 'Admin User',
          evidenceFiles: [
            { name: 'evidence_photo.jpg', url: '/images/aadhaar_front.jpg', size: '340 KB' },
            { name: 'invoice_copy.pdf', url: '/images/pan_card.jpg', size: '180 KB' }
          ],
          createdAt: c.createdDate,
          updatedAt: c.updatedDate,
          targetResolutionAt: new Date(c.createdDate.getTime() + 48 * 3600 * 1000),
          messages: {
            create: [
              {
                senderType: 'CUSTOMER',
                senderName: c.userName,
                message: c.subjectDescription,
                createdAt: c.createdDate,
                attachments: [{ name: 'issue_screenshot.jpg', url: '/images/aadhaar_front.jpg', size: '340 KB' }]
              },
              {
                senderType: 'VENDOR',
                senderName: c.vendorName,
                message: `Vendor acknowledged ticket for ${c.relatedOrderId}. Investigation underway.`,
                createdAt: new Date(c.createdDate.getTime() + 3600 * 1000)
              }
            ]
          },
          investigationNotes: {
            create: [
              {
                authorName: 'Investigation Officer',
                findings: `Verified initial complaint for order ${c.relatedOrderId}. Customer evidence reviewed against seller records.`,
                remarks: 'Requested invoice verification from billing gateway.',
                createdAt: c.createdDate
              }
            ]
          },
          activityLogs: {
            create: [
              {
                operator: c.userName,
                action: `Formal complaint submitted via ${c.channel}`,
                details: c.subjectTitle,
                createdAt: c.createdDate
              },
              {
                operator: 'System Dispatcher',
                action: 'Assigned to Support Department (Officer: Admin User)',
                createdAt: new Date(c.createdDate.getTime() + 1800 * 1000)
              }
            ]
          }
        }
      });
    }
  }

  // Seed remaining 140 complaints
  for (let i = 10; i < 150; i++) {
    const idNum = 1248 - i;
    const complaintNumber = `CMP-000${idNum}`;
    const user = USERS_LIST[i % USERS_LIST.length];
    const category = COMPLAINT_CATEGORIES[i % COMPLAINT_CATEGORIES.length];
    const priority = COMPLAINT_PRIORITIES[i % COMPLAINT_PRIORITIES.length];
    const severity = COMPLAINT_SEVERITIES[i % COMPLAINT_SEVERITIES.length];
    const status = COMPLAINT_STATUSES[i % COMPLAINT_STATUSES.length];
    const channel = COMPLAINT_CHANNELS[i % COMPLAINT_CHANNELS.length];
    const vendor = COMPLAINT_VENDORS[i % COMPLAINT_VENDORS.length];
    const dept = COMPLAINT_DEPARTMENTS[i % COMPLAINT_DEPARTMENTS.length];

    const day = Math.max(1, 12 - Math.floor(i / 13));
    const hour = (9 + (i * 3)) % 12 || 10;
    const min = (10 + (i * 7)) % 60;
    const createdDate = new Date(2024, 4, day, hour, min);

    const existing = await prisma.complaint.findUnique({ where: { complaintNumber } });
    if (!existing) {
      await prisma.complaint.create({
        data: {
          complaintNumber,
          userName: user.name,
          userEmail: user.email,
          userPhone: user.phone,
          vendorName: vendor,
          relatedOrderId: `#ORD-${9800 - i}`,
          relatedAmount: `₹${((i % 12) + 1) * 2200 + 499}`,
          relatedOrderStatus: status === 'RESOLVED' || status === 'CLOSED' ? 'Settled' : 'Under Dispute',
          subjectTitle: `${category} issue - ${complaintNumber}`,
          subjectDescription: `Formal customer dispute filed regarding ${category.toLowerCase()} under order #ORD-${9800 - i}.`,
          category,
          priority,
          severity,
          status,
          channel,
          assignedDepartment: dept,
          assignedAgent: 'Admin User',
          evidenceFiles: [
            { name: 'evidence_doc.pdf', url: '/images/aadhaar_front.jpg', size: '210 KB' }
          ],
          createdAt: createdDate,
          updatedAt: createdDate,
          targetResolutionAt: new Date(createdDate.getTime() + 48 * 3600 * 1000),
          messages: {
            create: [
              {
                senderType: 'CUSTOMER',
                senderName: user.name,
                message: `Formal complaint regarding ${category.toLowerCase()} transaction issue. Please resolve promptly.`,
                createdAt: createdDate
              }
            ]
          },
          investigationNotes: {
            create: [
              {
                authorName: 'Audit Inspector',
                findings: `Customer transaction logged on ${createdDate.toLocaleDateString()}. Assigned to ${dept}.`,
                remarks: 'Standard investigation protocol active.',
                createdAt: createdDate
              }
            ]
          },
          activityLogs: {
            create: [
              {
                operator: user.name,
                action: `Complaint filed via ${channel}`,
                details: `${category} dispute`,
                createdAt: createdDate
              }
            ]
          }
        }
      });
    }
  }
  console.log('150 Complaints seeded to PostgreSQL database.');

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
