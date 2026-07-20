import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private pubClient: Redis;
  private subClient: Redis;

  constructor(private readonly configService: ConfigService) {
    super();
  }

  async connectToRedis(): Promise<void> {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);

    this.pubClient = new Redis({
      host,
      port,
      maxRetriesPerRequest: null,
    });
    this.subClient = this.pubClient.duplicate();

    this.pubClient.on('error', (err) => {});
    this.subClient.on('error', (err) => {});

    this.adapterConstructor = createAdapter(this.pubClient, this.subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);

    const originalClose = server.close.bind(server);
    server.close = (callback?: (err?: any) => void) => {
      if (this.pubClient) this.pubClient.disconnect();
      if (this.subClient) this.subClient.disconnect();
      originalClose(callback);
    };

    return server;
  }
}
