import { Module } from '@nestjs/common';
import { AdminDashboardModule } from './dashboard/admin-dashboard.module';
import { AdminUsersModule } from './users/admin-users.module';
import { AdminProductsModule } from './products/admin-products.module';
import { AdminCategoriesModule } from './categories/admin-categories.module';
import { AdminReportsModule } from './reports/admin-reports.module';
import { AdminPaymentsModule } from './payments/admin-payments.module';
import { AdminReviewsModule } from './reviews/admin-reviews.module';
import { AdminNotificationsModule } from './notifications/admin-notifications.module';
import { AdminCmsModule } from './cms/admin-cms.module';
import { AdminBannersModule } from './banners/admin-banners.module';
import { AdminSettingsModule } from './settings/admin-settings.module';
import { AdminFeatureFlagsModule } from './feature-flags/admin-feature-flags.module';
import { AdminSystemModule } from './system/admin-system.module';
import { AdminSellersModule } from './sellers/admin-sellers.module';

@Module({
  imports: [
    AdminDashboardModule,
    AdminUsersModule,
    AdminProductsModule,
    AdminCategoriesModule,
    AdminReportsModule,
    AdminPaymentsModule,
    AdminReviewsModule,
    AdminNotificationsModule,
    AdminCmsModule,
    AdminBannersModule,
    AdminSettingsModule,
    AdminFeatureFlagsModule,
    AdminSystemModule,
    AdminSellersModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AdminModule {}
