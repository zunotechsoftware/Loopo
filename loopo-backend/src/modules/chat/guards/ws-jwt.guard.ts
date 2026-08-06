import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { AuthenticatedSocket } from '../interfaces/chat.interfaces';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient<AuthenticatedSocket>();
      
      // Try to get token from headers or query params or auth block
      const authHeader = client.handshake.headers.authorization || client.handshake.auth?.token;
      let token = '';

      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      } else if (client.handshake.query?.token) {
        token = client.handshake.query.token as string;
      } else if (authHeader) {
        token = authHeader; // Raw token string
      }

      if (!token) {
        throw new WsException('Unauthorized: Token is missing');
      }

      const secret = this.configService.get<string>('JWT_ACCESS_SECRET') || 'fallback_secret';
      const payload = await this.jwtService.verifyAsync(token, { secret });
      
      // Populate user on socket client
      client.data = client.data || {};
      client.data.user = {
        id: payload.sub || payload.id,
        email: payload.email,
        roles: payload.roles || [],
      };

      return true;
    } catch (err) {
      this.logger.error('WS Authentication Failed', err);
      throw new WsException('Unauthorized connection');
    }
  }
}
