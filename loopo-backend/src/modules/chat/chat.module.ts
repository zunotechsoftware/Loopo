import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './services/chat.service';
import { ChatRepository } from './repositories/chat.repository';
import { ChatGateway } from './gateways/chat.gateway';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
import { S3Module } from '../../shared/services/s3.module';
import { PrismaModule } from '../../shared/database/prisma.module';
import { RedisModule } from '../../shared/redis/redis.module';
import {
  ImageCompressionProcessor,
  ThumbnailGenerationProcessor,
  MessageAnalyticsProcessor,
  ConversationCleanupProcessor,
} from './processors/chat.processor';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    UsersModule,
    ProductsModule,
    S3Module,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION', '15m') as any,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: 'image-compression' },
      { name: 'thumbnail-generation' },
      { name: 'notification' },
      { name: 'message-analytics' },
      { name: 'conversation-cleanup' },
    ),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatRepository,
    ChatGateway,
    WsJwtGuard,
    ImageCompressionProcessor,
    ThumbnailGenerationProcessor,
    MessageAnalyticsProcessor,
    ConversationCleanupProcessor,
  ],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
