import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { KycRepository } from '../repositories/kyc.repository';
import { CreateKycDto, UpdateKycDto } from '../dto/kyc.dto';
import { KycStatus, KycDocumentType } from '@prisma/client';
import { PrismaService } from '../../../shared/database/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class KycService {
  constructor(
    private readonly kycRepository: KycRepository,
    private readonly prisma: PrismaService,
    @InjectQueue('email') private readonly emailQueue: Queue,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {}

  private async validateMedia(mediaId: string, userId: string, category: string) {
    const media = await this.prisma.mediaFile.findFirst({
      where: { id: mediaId, deletedAt: null },
    });
    if (!media) {
      throw new BadRequestException(`Media file with ID ${mediaId} not found`);
    }
    if (media.userId !== userId) {
      throw new ForbiddenException(`Media file does not belong to user`);
    }
    if (media.category !== category) {
      throw new BadRequestException(`Media category must be ${category}`);
    }
    return media;
  }

  async submitKyc(userId: string, dto: CreateKycDto) {
    const latest = await this.kycRepository.findLatestByUserId(userId);
    
    if (latest) {
      if (latest.status === KycStatus.APPROVED) {
        throw new BadRequestException('Your KYC is already approved');
      }
      if (latest.status === KycStatus.SUBMITTED || latest.status === KycStatus.UNDER_REVIEW) {
        throw new BadRequestException('You already have an active KYC application under review');
      }
    }

    // Validate images
    await this.validateMedia(dto.frontImageId, userId, 'KYC_FRONT');
    if (dto.backImageId) {
      await this.validateMedia(dto.backImageId, userId, 'KYC_BACK');
    }
    await this.validateMedia(dto.selfieImageId, userId, 'KYC_SELFIE');

    const status = dto.submit === false ? KycStatus.DRAFT : KycStatus.SUBMITTED;

    const kyc = await this.kycRepository.create(userId, {
      documentType: dto.documentType,
      documentNumber: dto.documentNumber,
      frontImage: { connect: { id: dto.frontImageId } },
      backImage: dto.backImageId ? { connect: { id: dto.backImageId } } : undefined,
      selfieImage: { connect: { id: dto.selfieImageId } },
      status,
      submittedAt: status === KycStatus.SUBMITTED ? new Date() : null,
    });

    if (status === KycStatus.SUBMITTED) {
      // Trigger KYC Submit notification queue
      await this.emailQueue.add('send-kyc-submitted', {
        email: kyc.user?.email || (await this.prisma.user.findUnique({ where: { id: userId } }))?.email,
        firstName: kyc.user?.firstName,
      });
    }

    return kyc;
  }

  async updateKyc(userId: string, dto: UpdateKycDto) {
    const latest = await this.kycRepository.findLatestByUserId(userId);
    if (!latest) {
      throw new NotFoundException('No KYC application found to update');
    }

    if (latest.status === KycStatus.APPROVED) {
      throw new BadRequestException('Approved KYC applications cannot be edited');
    }
    if (latest.status === KycStatus.SUBMITTED || latest.status === KycStatus.UNDER_REVIEW) {
      throw new BadRequestException('Active KYC applications under review cannot be edited');
    }

    // Media validation
    if (dto.frontImageId) {
      await this.validateMedia(dto.frontImageId, userId, 'KYC_FRONT');
    }
    if (dto.backImageId) {
      await this.validateMedia(dto.backImageId, userId, 'KYC_BACK');
    }
    if (dto.selfieImageId) {
      await this.validateMedia(dto.selfieImageId, userId, 'KYC_SELFIE');
    }

    const status = dto.submit === true ? KycStatus.SUBMITTED : latest.status;
    const submittedAt = status === KycStatus.SUBMITTED ? new Date() : latest.submittedAt;

    const updated = await this.kycRepository.update(
      latest.id,
      {
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        frontImage: dto.frontImageId ? { connect: { id: dto.frontImageId } } : undefined,
        backImage: dto.backImageId ? { connect: { id: dto.backImageId } } : undefined,
        selfieImage: dto.selfieImageId ? { connect: { id: dto.selfieImageId } } : undefined,
        status,
        submittedAt,
      },
      userId,
    );

    if (status === KycStatus.SUBMITTED) {
      await this.emailQueue.add('send-kyc-submitted', {
        email: updated.user?.email || (await this.prisma.user.findUnique({ where: { id: userId } }))?.email,
        firstName: updated.user?.firstName,
      });
    }

    return updated;
  }

  async getMyKyc(userId: string) {
    const kyc = await this.kycRepository.findLatestByUserId(userId);
    if (!kyc) {
      throw new NotFoundException('No KYC record found for this user');
    }
    return kyc;
  }

  async getKycById(id: string) {
    const kyc = await this.kycRepository.findById(id);
    if (!kyc) {
      throw new NotFoundException(`KYC record with ID ${id} not found`);
    }
    return kyc;
  }

  async listKycApplications(status?: KycStatus, skip?: number, take?: number) {
    return this.kycRepository.findAll({ status, skip, take });
  }

  async approveKyc(id: string, adminId: string) {
    const kyc = await this.kycRepository.findById(id);
    if (!kyc) {
      throw new NotFoundException(`KYC record with ID ${id} not found`);
    }

    if (kyc.status !== KycStatus.SUBMITTED && kyc.status !== KycStatus.UNDER_REVIEW) {
      throw new BadRequestException(`Cannot approve KYC in status: ${kyc.status}`);
    }

    const updated = await this.kycRepository.update(
      id,
      {
        status: KycStatus.APPROVED,
        approvedAt: new Date(),
        reviewedBy: adminId,
        remarks: 'Approved by admin',
      },
      adminId,
    );

    // Update verifiedBadge on user Profile to true
    await this.prisma.profile.update({
      where: { userId: kyc.userId },
      data: { verifiedBadge: true },
    });

    // Notify user via Email and Push
    const userEmail = kyc.user?.email || (await this.prisma.user.findUnique({ where: { id: kyc.userId } }))?.email;
    await this.emailQueue.add('send-kyc-approved', {
      email: userEmail,
      firstName: kyc.user?.firstName || 'User',
    });

    await this.notificationQueue.add('push-notification', {
      userId: kyc.userId,
      title: 'KYC Approved',
      body: 'Your identity verification was approved successfully!',
    });

    return updated;
  }

  async rejectKyc(id: string, adminId: string, remarks: string) {
    const kyc = await this.kycRepository.findById(id);
    if (!kyc) {
      throw new NotFoundException(`KYC record with ID ${id} not found`);
    }

    if (kyc.status !== KycStatus.SUBMITTED && kyc.status !== KycStatus.UNDER_REVIEW) {
      throw new BadRequestException(`Cannot reject KYC in status: ${kyc.status}`);
    }

    const updated = await this.kycRepository.update(
      id,
      {
        status: KycStatus.REJECTED,
        rejectedAt: new Date(),
        reviewedBy: adminId,
        remarks,
      },
      adminId,
    );

    // Ensure verifiedBadge on user Profile is false
    await this.prisma.profile.update({
      where: { userId: kyc.userId },
      data: { verifiedBadge: false },
    });

    // Notify user
    const userEmail = kyc.user?.email || (await this.prisma.user.findUnique({ where: { id: kyc.userId } }))?.email;
    await this.emailQueue.add('send-kyc-rejected', {
      email: userEmail,
      firstName: kyc.user?.firstName || 'User',
      remarks,
    });

    await this.notificationQueue.add('push-notification', {
      userId: kyc.userId,
      title: 'KYC Rejected',
      body: `Your identity verification was rejected. Reason: ${remarks}`,
    });

    return updated;
  }
}
