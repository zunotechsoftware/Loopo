import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../../users/services/users.service';
import { AuthRepository } from '../repositories/auth.repository';
import { RegisterDto } from '../dto/register.dto';
import { Provider, UserStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectQueue('email') private readonly emailQueue: Queue,
    @InjectQueue('sms') private readonly smsQueue: Queue,
  ) {}

  // --- Local Credentials Validation ---
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.password) {
      return null;
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  // --- Login & Token Generation ---
  async login(user: any, ipAddress?: string, userAgent?: string) {
    const payload = { email: user.email, sub: user.id, roles: user.roles };
    
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET') || 'fallback_secret',
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'fallback_secret',
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '30d') as any,
    });
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    
    // Refresh token expiry: 30 days
    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 30);

    // Save refresh token to database
    await this.authRepository.saveRefreshToken(user.id, hashedRefreshToken, refreshExpiry);

    // Create session tracking record
    const sessionExpiry = new Date();
    sessionExpiry.setDate(sessionExpiry.getDate() + 30);
    await this.authRepository.createSession(user.id, ipAddress || null, userAgent || null, sessionExpiry);

    // Update last login timestamp
    await this.usersService.update(user.id, { lastLoginAt: new Date() });

    // Clean sensitive properties from user object
    const { password, ...cleanUser } = user;

    return {
      accessToken,
      refreshToken,
      user: cleanUser,
    };
  }

  // --- Register Flow ---
  async register(dto: RegisterDto) {
    const existingEmail = await this.usersService.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException('Email is already registered');
    }

    if (dto.phone) {
      const existingPhone = await this.usersService.findByPhone(dto.phone);
      if (existingPhone) {
        throw new ConflictException('Phone number is already registered');
      }
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.usersService.create(
      {
        email: dto.email,
        phone: dto.phone || null,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        status: UserStatus.PENDING,
        provider: Provider.LOCAL,
      },
      ['USER'],
    );

    // Create email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24); // 24-hour expiry

    await this.authRepository.saveEmailVerificationToken(user.id, verificationToken, expiry);

    // Queue email sending job
    await this.emailQueue.add('send-verification', {
      email: user.email,
      firstName: user.firstName,
      token: verificationToken,
    });

    return {
      success: true,
      message: 'Registration successful. Verification email has been queued.',
    };
  }

  // --- Refresh Token Rotation ---
  async refreshTokens(refreshToken: string, ipAddress?: string, userAgent?: string) {
    // Find refresh token in DB
    const allTokens = await this.prismaFindRefreshToken(refreshToken);
    if (!allTokens) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { tokenRecord, user } = allTokens;

    // Check if token has been revoked
    if (tokenRecord.revokedAt) {
      // Security Alert: Potential token reuse / compromise! Revoke all tokens for user.
      await this.authRepository.revokeAllUserRefreshTokens(tokenRecord.userId);
      throw new UnauthorizedException('Token compromise detected. All sessions revoked.');
    }

    // Check if token has expired
    if (new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Issue new tokens
    const payload = { email: user.email, sub: user.id, roles: user.roles };
    const newAccessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET') || 'fallback_secret',
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m') as any,
    });

    const newRefreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'fallback_secret',
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '30d') as any,
    });
    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);

    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 30);

    // Transactionally update the rotated token and save the new one
    await this.authRepository.replaceRefreshToken(tokenRecord.id, hashedNewRefreshToken);
    await this.authRepository.saveRefreshToken(user.id, hashedNewRefreshToken, refreshExpiry);

    // Create fresh session entry
    const sessionExpiry = new Date();
    sessionExpiry.setDate(sessionExpiry.getDate() + 30);
    await this.authRepository.createSession(user.id, ipAddress || null, userAgent || null, sessionExpiry);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  // Helper method to look up token by scanning hashed entries
  private async prismaFindRefreshToken(rawToken: string) {
    const rawTokens = await this.authRepository.findActiveRefreshTokens();

    for (const record of rawTokens) {
      const match = await bcrypt.compare(rawToken, record.token);
      if (match) {
        // Flatten user roles
        const roles = record.user.roles.map((ur) => ur.role.name);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { roles: _, ...cleanUser } = record.user;
        return {
          tokenRecord: record,
          user: { ...cleanUser, roles },
        };
      }
    }
    return null;
  }

  // --- Logout Flow ---
  async logout(refreshToken: string) {
    const tokenInfo = await this.prismaFindRefreshToken(refreshToken);
    if (tokenInfo) {
      await this.authRepository.revokeRefreshToken(tokenInfo.tokenRecord.id);
      await this.authRepository.deleteAllUserSessions(tokenInfo.tokenRecord.userId);
    }
    return { success: true, message: 'Logged out successfully' };
  }

  // --- Forgot Password ---
  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Prevent user enumeration by returning generic success message
      return { success: true, message: 'If the email exists, a reset link has been queued.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1); // 1-hour expiry

    await this.authRepository.savePasswordResetToken(user.id, resetToken, expiry);

    // Queue password reset email
    await this.emailQueue.add('send-reset-password', {
      email: user.email,
      token: resetToken,
    });

    return {
      success: true,
      message: 'If the email exists, a reset link has been queued.',
    };
  }

  // --- Reset Password ---
  async resetPassword(token: string, newPass: string) {
    const tokenRecord = await this.authRepository.findPasswordResetToken(token);
    if (!tokenRecord || tokenRecord.usedAt) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    if (new Date() > tokenRecord.expiresAt) {
      throw new BadRequestException('Password reset token has expired');
    }

    const hashedPassword = await bcrypt.hash(newPass, 12);
    await this.usersService.update(tokenRecord.userId, { password: hashedPassword });
    await this.authRepository.markPasswordResetTokenUsed(tokenRecord.id);

    // Revoke all existing sessions for safety after password change
    await this.authRepository.revokeAllUserRefreshTokens(tokenRecord.userId);
    await this.authRepository.deleteAllUserSessions(tokenRecord.userId);

    return {
      success: true,
      message: 'Password has been reset successfully. Please login with your new credentials.',
    };
  }

  // --- Email Verification Verification ---
  async sendEmailVerification(userId: string) {
    const user = await this.usersService.findById(userId);
    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);

    await this.authRepository.saveEmailVerificationToken(user.id, token, expiry);

    await this.emailQueue.add('send-verification', {
      email: user.email,
      firstName: user.firstName,
      token,
    });

    return { success: true, message: 'Verification email has been queued.' };
  }

  async verifyEmail(token: string) {
    const tokenRecord = await this.authRepository.findEmailVerificationToken(token);
    if (!tokenRecord || tokenRecord.verifiedAt) {
      throw new BadRequestException('Invalid or already used verification token');
    }

    if (new Date() > tokenRecord.expiresAt) {
      throw new BadRequestException('Verification token has expired');
    }

    // Verify email & activate account
    await this.usersService.update(tokenRecord.userId, {
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
    });

    await this.authRepository.markEmailVerificationTokenVerified(tokenRecord.id);

    return { success: true, message: 'Email has been verified successfully.' };
  }

  // --- Phone OTP ---
  async sendPhoneOtp(userId: string, phone: string) {
    // Generate secure 6 digit numeric code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 8);

    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10); // 10 minute expiry

    await this.authRepository.savePhoneOtp(userId, hashedOtp, phone, expiry);

    // Queue SMS job
    await this.smsQueue.add('send-otp', {
      phone,
      otp,
    });

    return { success: true, message: 'Phone verification OTP has been queued.' };
  }

  async verifyPhoneOtp(userId: string, phone: string, otp: string) {
    const otpRecord = await this.authRepository.findPhoneOtp(userId, phone);
    if (!otpRecord) {
      throw new BadRequestException('No active OTP found for this number');
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException('OTP has expired');
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) {
      throw new BadRequestException('Invalid OTP code');
    }

    await this.usersService.update(userId, {
      phone,
      isPhoneVerified: true,
    });

    await this.authRepository.markPhoneOtpVerified(otpRecord.id);

    return { success: true, message: 'Phone number has been verified successfully.' };
  }

  // --- Social Logins Validation ---
  async validateOAuthUser(profile: any, provider: Provider) {
    const providerId = profile.id;
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

    let user = await this.usersService.findByProvider(provider, providerId);

    if (!user && email) {
      // If provider ID not matched, check if a user with that email already exists
      user = await this.usersService.findByEmail(email);
      if (user) {
        // Link OAuth credentials to existing email account
        user = await this.usersService.update(user.id, {
          provider,
          providerId,
          profileImage: profile.photos && profile.photos[0] ? profile.photos[0].value : user.profileImage,
        });
      }
    }

    if (!user) {
      // Create new user account for OAuth
      user = await this.usersService.create(
        {
          email,
          firstName: profile.name?.givenName || profile.displayName || '',
          lastName: profile.name?.familyName || '',
          profileImage: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
          isEmailVerified: true, // Social accounts are trusted as verified
          status: UserStatus.ACTIVE,
          provider,
          providerId,
        },
        ['USER'],
      );
    }

    return user;
  }
}
