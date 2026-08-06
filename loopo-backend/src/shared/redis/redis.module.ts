import { Global, Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        let client: Redis;

        if (redisUrl) {
          client = new Redis(redisUrl, { maxRetriesPerRequest: null });
        } else {
          const host = configService.get<string>('REDIS_HOST', 'localhost');
          const port = configService.get<number>('REDIS_PORT', 6379);
          client = new Redis({
            host,
            port,
            maxRetriesPerRequest: null, // Critical configuration for BullMQ integration
          });
        }

        client.on('error', (err) => {
          // Suppress error crashes during testing/transient disconnects
        });
        return client;
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
