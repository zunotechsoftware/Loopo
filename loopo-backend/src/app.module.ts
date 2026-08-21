import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from './shared/database/prisma.module';
import { RedisModule } from './shared/redis/redis.module';
import { QueuesModule } from './shared/queues/queues.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { S3Module } from './shared/services/s3.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { KycModule } from './modules/kyc/kyc.module';
import { NotificationSettingsModule } from './modules/notification-settings/notification-settings.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { SearchModule } from './modules/search/search.module';
import { InteractionsModule } from './modules/interactions/interactions.module';
import { ChatModule } from './modules/chat/chat.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ReputationModule } from './modules/reputation/reputation.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AdminModule } from './modules/admin/admin.module';
import { SellerProfileModule } from './modules/seller-profile/seller-profile.module';
import { OrdersModule } from './modules/orders/orders.module';
import { BrandsModule } from './modules/brands/brands.module';
import { EmailTemplatesModule } from './modules/email-templates/email-templates.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogInterceptor } from './shared/common/interceptors/audit-log.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100,
      },
    ]),
    EventEmitterModule.forRoot(),
    PrismaModule,
    RedisModule,
    QueuesModule,
    S3Module,
    RbacModule,
    UsersModule,
    AuthModule,
    AddressesModule,
    KycModule,
    NotificationSettingsModule,
    AuditLogsModule,
    CategoriesModule,
    ProductsModule,
    SearchModule,
    InteractionsModule,
    ChatModule,
    PaymentsModule,
    SubscriptionsModule,
    ReportsModule,
    ModerationModule,
    ReviewsModule,
    ReputationModule,
    AnalyticsModule,
    DashboardModule,
    AdminModule,
    SellerProfileModule,
    OrdersModule,
    BrandsModule,
    EmailTemplatesModule,
    NotificationsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}

