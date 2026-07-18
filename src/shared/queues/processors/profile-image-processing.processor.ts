import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../database/prisma.service';
import { S3Service } from '../../services/s3.service';
import { RedisService } from '../../redis/redis.service';
import sharp from 'sharp';

@Processor('profile-image-processing')
export class ProfileImageProcessingProcessor extends WorkerHost {
  private readonly logger = new Logger(ProfileImageProcessingProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly redisService: RedisService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing image job ${job.id} for user ${job.data.userId}...`);
    const { userId, mediaId, fileKey, category } = job.data;

    try {
      // 1. Fetch the MediaFile
      const media = await this.prisma.mediaFile.findUnique({
        where: { id: mediaId },
      });
      if (!media) {
        this.logger.error(`MediaFile ${mediaId} not found in database.`);
        return { success: false, error: 'MediaFile not found' };
      }

      this.logger.log(`Downloading original file from: ${media.fileUrl}`);
      
      // 2. Download original image via HTTP
      const response = await fetch(media.fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image from S3/MinIO: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 3. Optimize original image to WebP (max width 800px)
      this.logger.log('Optimizing original image to WebP...');
      const optimizedBuffer = await sharp(buffer)
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      const optimizedKey = `${category}/${userId}/opt-${Date.now()}.webp`;
      const optimizedUrl = await this.s3Service.uploadBuffer(
        optimizedBuffer,
        optimizedKey,
        'image/webp',
      );

      // 4. Generate Thumbnail (150x150)
      this.logger.log('Generating 150x150 thumbnail...');
      const thumbnailBuffer = await sharp(buffer)
        .resize(150, 150, { fit: 'cover' })
        .webp({ quality: 70 })
        .toBuffer();

      const thumbnailKey = `${category}/${userId}/thumb-${Date.now()}.webp`;
      const thumbnailUrl = await this.s3Service.uploadBuffer(
        thumbnailBuffer,
        thumbnailKey,
        'image/webp',
      );

      // 5. Delete the old unoptimized file from S3/MinIO
      await this.s3Service.deleteFile(fileKey);

      // 6. Update database MediaFile
      await this.prisma.mediaFile.update({
        where: { id: mediaId },
        data: {
          fileName: optimizedKey,
          fileUrl: optimizedUrl,
          thumbnailUrl,
          status: 'READY',
          fileSize: optimizedBuffer.length,
          mimeType: 'image/webp',
        },
      });

      // 7. Recalculate user profile completion (since thumbnail is set)
      const profile = await this.prisma.profile.findUnique({
        where: { userId },
      });
      if (profile) {
        // Recalculate completion
        const fields = [
          'firstName', 'lastName', 'displayName', 'bio', 'email', 'phone',
          'dateOfBirth', 'gender', 'country', 'state', 'city', 'zipCode',
          'preferredLanguage', 'timezone', 'website', 'profileImageId', 'coverImageId'
        ];
        let filled = 0;
        for (const f of fields) {
          if (profile[f] !== null && profile[f] !== undefined && profile[f] !== '') {
            filled++;
          }
        }
        const completion = Math.round((filled / fields.length) * 100);

        await this.prisma.profile.update({
          where: { userId },
          data: { profileCompletionPercentage: completion },
        });
      }

      // 8. Invalidate profile cache
      await this.redisService.del(`user:profile:${userId}`);

      this.logger.log(`Image processing job ${job.id} completed successfully.`);
      return { success: true, optimizedUrl, thumbnailUrl };
    } catch (err: any) {
      this.logger.error(`Failed to process image job ${job.id}:`, err);
      // Mark MediaFile as FAILED
      await this.prisma.mediaFile.update({
        where: { id: mediaId },
        data: { status: 'FAILED' },
      }).catch((dbErr) => this.logger.error('Failed to update MediaFile to FAILED:', dbErr));

      return { success: false, error: err.message };
    }
  }
}
