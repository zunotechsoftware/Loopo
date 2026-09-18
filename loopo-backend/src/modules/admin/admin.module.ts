import { Module } from '@nestjs/common';
import { AdminDashboardModule } from './dashboard/admin-dashboard.module';
import { AdminUsersModule } from './users/admin-users.module';
import { AdminProductsModule } from './products/admin-products.module';
import { AdminCategoriesModule } from './categories/admin-categories.module';
import { AdminPaymentsModule } from './payments/admin-payments.module';
import { AdminNotificationsModule } from './notifications/admin-notifications.module';
import { AdminCmsModule } from './cms/admin-cms.module';
import { AdminBannersModule } from './banners/admin-banners.module';
import { AdminSettingsModule } from './settings/admin-settings.module';
import { AdminFeatureFlagsModule } from './feature-flags/admin-feature-flags.module';
import { AdminSystemModule } from './system/admin-system.module';
import { AdminSellersModule } from './sellers/admin-sellers.module';
import { AdminAdvertisementsModule } from './advertisements/admin-advertisements.module';
import { AdminCouponsModule } from './coupons/admin-coupons.module';
import { AdminRolesModule } from './roles/admin-roles.module';
import { AdminAuditLogsModule } from './audit-logs/admin-audit-logs.module';

// Admin reviews/reports management deliberately does NOT have its own
// modules here: ./reviews and ./reports used to exist as fully separate
// implementations (AdminReviewsModule/AdminReportsModule) that duplicated
// admin/reviews and admin/reports already correctly implemented inside the
// ReviewsModule and ReportsModule feature modules respectively - and, due to
// an unrelated bug, were registered with a redundant 'api/v1/' prefix on
// their own @Controller() path stacking on top of the global prefix,
// making every route in them permanently unreachable (404) regardless of
// this duplication. Deleted rather than fixed-in-place since the feature
// modules' versions were confirmed to be a strict superset (reports) or
// were merged forward (reviews: pagination, type filter, and get-by-id were
// ported into ReviewsService/AdminReviewsController before removal). See
// agents/01-context/known-issues.md for the full investigation.
@Module({
  imports: [
    AdminDashboardModule,
    AdminUsersModule,
    AdminProductsModule,
    AdminCategoriesModule,
    AdminPaymentsModule,
    AdminNotificationsModule,
    AdminCmsModule,
    AdminBannersModule,
    AdminSettingsModule,
    AdminFeatureFlagsModule,
    AdminSystemModule,
    AdminSellersModule,
    AdminAdvertisementsModule,
    AdminCouponsModule,
    AdminRolesModule,
    AdminAuditLogsModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AdminModule {}
