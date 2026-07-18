import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

