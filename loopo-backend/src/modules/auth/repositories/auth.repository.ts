import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  // --- Refresh Tokens ---
  async saveRefreshToken(userId: string, hashedToken: string, expiresAt: Date) {
    return this.prisma.refreshToken.create({
      data: {
        userId,
        token: hashedToken,
        expiresAt,
      },
    });
  }

  async findRefreshToken(token: string) {
    return this.prisma.refreshToken.findUnique({
      where: { token },
    });
  }

  async revokeRefreshToken(id: string) {
    return this.prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async replaceRefreshToken(id: string, newHashedToken: string) {
    return this.prisma.refreshToken.update({
      where: { id },
      data: {
        revokedAt: new Date(),
        replacedByToken: newHashedToken,
      },
    });
  }

  async revokeAllUserRefreshTokens(userId: string) {
    return this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async findActiveRefreshTokens() {
    return this.prisma.refreshToken.findMany({
      where: { revokedAt: null },
      include: {
        user: {
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });
  }

  // --- Email Verification Tokens ---
  async saveEmailVerificationToken(userId: string, token: string, expiresAt: Date) {
    await this.prisma.emailVerificationToken.deleteMany({
      where: { userId, verifiedAt: null },
    });

    return this.prisma.emailVerificationToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async findEmailVerificationToken(token: string) {
    return this.prisma.emailVerificationToken.findUnique({
      where: { token },
    });
  }

  async markEmailVerificationTokenVerified(id: string) {
    return this.prisma.emailVerificationToken.update({
      where: { id },
      data: { verifiedAt: new Date() },
    });
  }

  // --- Password Reset Tokens ---
  async savePasswordResetToken(userId: string, token: string, expiresAt: Date) {
    await this.prisma.passwordResetToken.deleteMany({
      where: { userId, usedAt: null },
    });

    return this.prisma.passwordResetToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async findPasswordResetToken(token: string) {
    return this.prisma.passwordResetToken.findUnique({
      where: { token },
    });
  }

  async markPasswordResetTokenUsed(id: string) {
    return this.prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  // --- Phone OTPs ---
  async savePhoneOtp(userId: string, hashedOtp: string, phone: string, expiresAt: Date) {
    await this.prisma.phoneOtp.deleteMany({
      where: { userId, phone, verifiedAt: null },
    });

    return this.prisma.phoneOtp.create({
      data: {
        userId,
        otp: hashedOtp,
        phone,
        expiresAt,
      },
    });
  }

  async findPhoneOtp(userId: string, phone: string) {
    return this.prisma.phoneOtp.findFirst({
      where: { userId, phone, verifiedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markPhoneOtpVerified(id: string) {
    return this.prisma.phoneOtp.update({
      where: { id },
      data: { verifiedAt: new Date() },
    });
  }

  // --- Sessions ---
  async createSession(userId: string, ipAddress: string | null, userAgent: string | null, expiresAt: Date) {
    return this.prisma.session.create({
      data: {
        userId,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });
  }

  async deleteSession(id: string) {
    return this.prisma.session.delete({
      where: { id },
    });
  }

  async deleteAllUserSessions(userId: string) {
    return this.prisma.session.deleteMany({
      where: { userId },
    });
  }
}
