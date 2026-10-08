import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../shared/database/prisma.service';
import { RedisService } from '../../../shared/redis/redis.service';

// Statuses that must never be allowed to keep using an already-issued access
// token or to refresh for a new one. PENDING (pre-verification) is
// intentionally allowed through - it's a normal, non-punitive state.
const BLOCKED_STATUSES = new Set(['SUSPENDED', 'BLOCKED', 'DELETED']);
const STATUS_CACHE_TTL_SECONDS = 30;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {
    const secret = configService.get<string>('JWT_ACCESS_SECRET');
    if (!secret) {
      // Never fall back to a hardcoded secret here: a guessable/known
      // verification secret means anyone can forge a valid access token.
      // Fail startup loudly instead so a missing env var can't turn into a
      // silent auth bypass.
      throw new Error('JWT_ACCESS_SECRET is not configured');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    const status = await this.getUserStatus(payload.sub);
    // A deleted/never-found account and a currently-suspended/blocked one
    // are both rejected the same way - no distinction that would let an
    // attacker enumerate account state via the auth error.
    if (!status || BLOCKED_STATUSES.has(status)) {
      throw new UnauthorizedException('This account no longer has access. Please contact support.');
    }

    // Return standard flat user payload
    return { id: payload.sub, email: payload.email, roles: payload.roles };
  }

  private async getUserStatus(userId: string): Promise<string | null> {
    const cacheKey = `user:status:${userId}`;
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (cacheErr) {
      console.error(`Redis error fetching status for user ${userId}:`, cacheErr);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { status: true },
    });
    const status = user?.status ?? null;

    if (status) {
      try {
        await this.redisService.set(cacheKey, status, STATUS_CACHE_TTL_SECONDS);
      } catch (cacheErr) {
        console.error(`Redis error caching status for user ${userId}:`, cacheErr);
      }
    }

    return status;
  }
}
