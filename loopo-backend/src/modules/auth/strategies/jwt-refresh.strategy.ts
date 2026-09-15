import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      // See jwt.strategy.ts — no hardcoded fallback here, ever.
      throw new Error('JWT_REFRESH_SECRET is not configured');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.body?.refreshToken || request?.headers?.authorization?.replace('Bearer ', '');
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.body?.refreshToken || req.headers.authorization?.replace('Bearer ', '');
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    return { id: payload.sub, email: payload.email, roles: payload.roles, refreshToken };
  }
}
