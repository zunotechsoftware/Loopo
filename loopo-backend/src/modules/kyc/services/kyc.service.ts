import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { KycRepository } from '../repositories/kyc.repository';
import { CreateKycDto, UpdateKycDto } from '../dto/kyc.dto';
import { KycUploadUrlDto, KycUploadSlot } from '../dto/kyc-upload-url.dto';
import { KycStatus, KycDocumentType } from '@prisma/client';
import { PrismaService } from '../../../shared/database/prisma.service';
import { S3Service } from '../../../shared/services/s3.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

const SLOT_TO_CATEGORY: Record<KycUploadSlot, string> = {
  FRONT: 'KYC_FRONT',
  BACK: 'KYC_BACK',
  SELFIE: 'KYC_SELFIE',
};

@Injectable()
export class KycService {
  constructor(
    private readonly kycRepository: KycRepository,
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    @InjectQueue('email') private readonly emailQueue: Queue,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {}

  /**
   * Generates a signed S3 upload URL for a KYC document image and registers
   * the resulting object as a PENDING MediaFile, mirroring
   * UsersService.getUploadUrl. Without this, submitKyc/updateKyc's
   * frontImageId/backImageId/selfieImageId can never be legitimately
   * obtained by any real client.
   */
  async getUploadUrl(userId: string, dto: KycUploadUrlDto) {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (dto.fileSize > MAX_SIZE) {
      throw new BadRequestException('File size exceeds the 5MB limit');
    }

    const category = SLOT_TO_CATEGORY[dto.slot];
    const { uploadUrl, fileKey, fileUrl } = await this.s3Service.generatePresignedUploadUrl(
      userId,
      dto.fileName,
      category,
      dto.fileType,
    );

    // fileName stores the S3 object key (fileKey), not the original
    // filename — there is no separate fileKey column on MediaFile.
    const media = await this.prisma.mediaFile.create({
      data: {
        userId,
        fileName: fileKey,
        fileUrl,
        fileSize: dto.fileSize,
        mimeType: dto.fileType,
        category,
        status: 'PENDING',
        createdBy: userId,
      },
    });

    return {
      uploadUrl,
      fileKey,
      mediaId: media.id,
    };
  }

  /**
   * KYC images are a private category — never return the raw stored
   * fileUrl to a client. Always regenerate a short-lived signed GET URL
   * at read time from the MediaFile's fileName (which holds the S3 key).
   */
  private async signMediaTriplet<T extends { frontImage?: any; backImage?: any; selfieImage?: any }>(
    entity: T | null | undefined,
  ): Promise<T | null | undefined> {
    if (!entity) return entity;
    const sign = async (media: any) => {
      if (!media) return media;
      try {
        return { ...media, fileUrl: await this.s3Service.getSignedReadUrl(media.fileName) };
      } catch {
        // Fail safe rather than crash the response; worst case the
        // (still-private, bucket-policy-protected) stored URL is shown.
        return media;
      }
    };
    return {
      ...entity,
      frontImage: await sign(entity.frontImage),
      backImage: await sign(entity.backImage),
      selfieImage: await sign(entity.selfieImage),
    };
  }

  private async signKyc(kyc: any): Promise<any> {
    if (!kyc) return kyc;
    let signed = await this.signMediaTriplet(kyc);
    if (signed?.user?.kycDocuments?.length) {
      signed = {
        ...signed,
        user: {
          ...signed.user,
          kycDocuments: await Promise.all(
            signed.user.kycDocuments.map((doc: any) => this.signMediaTriplet(doc)),
          ),
        },
      };
    }
    return signed;
  }

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

    return this.signKyc(kyc);
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

    return this.signKyc(updated);
  }

  async getMyKyc(userId: string) {
    const kyc = await this.kycRepository.findLatestByUserId(userId);
    if (!kyc) {
      throw new NotFoundException('No KYC record found for this user');
    }
    return this.signKyc(kyc);
  }

  async getKycById(id: string) {
    const kyc = await this.kycRepository.findById(id);
    if (!kyc) {
      throw new NotFoundException(`KYC record with ID ${id} not found`);
    }
    return this.signKyc(kyc);
  }

  async listKycApplications(status?: KycStatus, skip?: number, take?: number) {
    const results = await this.kycRepository.findAll({ status, skip, take });
    return Promise.all(results.map((kyc) => this.signKyc(kyc)));
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

    return this.signKyc(updated);
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

    return this.signKyc(updated);
  }
}
