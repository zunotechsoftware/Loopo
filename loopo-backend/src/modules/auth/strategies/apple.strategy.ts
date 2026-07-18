import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';
import { Provider } from '@prisma/client';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('APPLE_CLIENT_ID') || 'mock-id',
      teamID: configService.get<string>('APPLE_TEAM_ID') || 'mock-team',
      keyID: configService.get<string>('APPLE_KEY_ID') || 'mock-key',
      privateKeyString: configService.get<string>('APPLE_PRIVATE_KEY') || '',
      callbackURL: configService.get<string>('APPLE_CALLBACK_URL') || 'http://localhost:3000/api/v1/auth/apple/callback',
      scope: ['email', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    idToken: string,
    profile: any,
    done: (err: any, user?: any) => void,
  ): Promise<any> {
    try {
      const formattedProfile = {
        id: profile.id || profile.sub,
        emails: profile.email ? [{ value: profile.email }] : [],
        name: profile.name ? { givenName: profile.name.firstName, familyName: profile.name.lastName } : null,
      };

      const user = await this.authService.validateOAuthUser(formattedProfile, Provider.APPLE);
      done(null, user);
    } catch (err) {
      done(err, false);
    }
  }
}
