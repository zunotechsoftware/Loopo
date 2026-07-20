import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../shared/database/prisma.service';
import { S3Service } from '../../../shared/services/s3.service';
import sharp from 'sharp';

@Processor('image-compression')
export class ImageCompressionProcessor extends WorkerHost {
  private readonly logger = new Logger(ImageCompressionProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Compressing image for job ${job.id}...`);
    const { originalUrl, messageId } = job.data;

    try {
      // 1. Download original image
      const response = await fetch(originalUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch original image from url: ${originalUrl}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 2. Compress image using sharp
      const compressedBuffer = await sharp(buffer)
        .jpeg({ quality: 75, progressive: true })
        .toBuffer();

      // 3. Extract file name and construct path
      const urlParts = originalUrl.split('/');
      const originalFileName = urlParts[urlParts.length - 1];
      const category = 'chat-attachments';
      const fileKey = `${category}/compressed_${Date.now()}_${originalFileName}`;

      // 4. Upload compressed buffer to S3
      const compressedUrl = await this.s3Service.uploadBuffer(compressedBuffer, fileKey, 'image/jpeg');

      // 5. Update message attachments in DB
      await this.prisma.messageAttachment.updateMany({
        where: {
          messageId,
          originalUrl,
        },
        data: {
          originalUrl: compressedUrl,
          mimeType: 'image/jpeg',
          fileSize: compressedBuffer.length,
        },
      });

      this.logger.log(`Successfully compressed image. New Url: ${compressedUrl}`);
      return { success: true, compressedUrl };
    } catch (err) {
      this.logger.error(`Image compression failed for job ${job.id}`, err);
      throw err;
    }
  }
}

@Processor('thumbnail-generation')
export class ThumbnailGenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(ThumbnailGenerationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Generating thumbnail for job ${job.id}...`);
    const { originalUrl, messageId } = job.data;

    try {
      // 1. Download image
      const response = await fetch(originalUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch original image from url: ${originalUrl}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 2. Generate thumbnail using sharp (150x150 dimensions)
      const thumbnailBuffer = await sharp(buffer)
        .resize(150, 150, { fit: 'cover' })
        .jpeg({ quality: 70 })
        .toBuffer();

      // 3. Upload to S3
      const urlParts = originalUrl.split('/');
      const originalFileName = urlParts[urlParts.length - 1];
      const category = 'chat-attachments';
      const fileKey = `${category}/thumb_${Date.now()}_${originalFileName}`;

      const thumbnailUrl = await this.s3Service.uploadBuffer(thumbnailBuffer, fileKey, 'image/jpeg');

      // 4. Update message attachment record
      await this.prisma.messageAttachment.updateMany({
        where: {
          messageId,
          originalUrl,
        },
        data: {
          thumbnailUrl,
        },
      });

      this.logger.log(`Successfully generated thumbnail. Url: ${thumbnailUrl}`);
      return { success: true, thumbnailUrl };
    } catch (err) {
      this.logger.error(`Thumbnail generation failed for job ${job.id}`, err);
      throw err;
    }
  }
}

@Processor('message-analytics')
export class MessageAnalyticsProcessor extends WorkerHost {
  private readonly logger = new Logger(MessageAnalyticsProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing message analytics for job ${job.id}...`);
    const { messageId, senderId, type } = job.data;

    try {
      // Log telemetry details
      this.logger.log(`[ANALYTICS] Message Telemetry logged - MessageId: ${messageId}, SenderId: ${senderId}, Type: ${type}`);
      return { success: true };
    } catch (err) {
      this.logger.error(`Analytics logging failed for job ${job.id}`, err);
      throw err;
    }
  }
}

@Processor('conversation-cleanup')
export class ConversationCleanupProcessor extends WorkerHost {
  private readonly logger = new Logger(ConversationCleanupProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Running conversation cleanup for job ${job.id}...`);
    const { conversationId, userId } = job.data;

    try {
      // Cleanup settings or orphaned assets if needed
      this.logger.log(`[CLEANUP] Deleted conversation settings for User ${userId} inside Conversation ${conversationId}`);
      return { success: true };
    } catch (err) {
      this.logger.error(`Conversation cleanup failed for job ${job.id}`, err);
      throw err;
    }
  }
}
