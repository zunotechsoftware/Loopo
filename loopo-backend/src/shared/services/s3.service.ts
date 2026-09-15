import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

/**
 * Media categories that are safe to serve as world-readable static assets
 * (product listing photos/videos, profile & cover pictures). Every other
 * category (KYC documents, chat attachments) MUST stay private and can only
 * ever be read back via a freshly-generated, short-lived signed URL —
 * never a stored permanent link. Category names double as the first path
 * segment of every object key (see generatePresignedUploadUrl), which is
 * what lets the bucket policy below scope public access by prefix.
 */
export const PUBLIC_MEDIA_CATEGORIES = ['PROFILE_IMAGE', 'COVER_IMAGE', 'listing_images', 'listing_videos'];

@Injectable()
export class S3Service implements OnModuleInit {
  private readonly logger = new Logger(S3Service.name);
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('S3_REGION', 'us-east-1');
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID', 'minioadmin');
    const secretAccessKey = this.configService.get<string>('S3_SECRET_ACCESS_KEY', 'minioadminpassword');
    const endpoint = this.configService.get<string>('S3_ENDPOINT', 'http://localhost:9000');
    this.bucketName = this.configService.get<string>('S3_BUCKET_NAME', 'loopo-marketplace');

    const s3Config: any = {
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    };

    if (endpoint) {
      s3Config.endpoint = endpoint;
      s3Config.forcePathStyle = true; // Essential configuration for MinIO/LocalStack
    }

    this.s3Client = new S3Client(s3Config);
  }

  async onModuleInit() {
    this.logger.log('Initializing S3 storage integration...');
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      this.logger.log(`Storage bucket "${this.bucketName}" is ready.`);
    } catch (err: any) {
      // Bucket doesn't exist or is not accessible
      if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        this.logger.warn(`Storage bucket "${this.bucketName}" not found. Creating bucket...`);
        try {
          await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
          this.logger.log(`Storage bucket "${this.bucketName}" created successfully.`);
        } catch (createErr) {
          this.logger.error(`Error auto-creating storage bucket "${this.bucketName}":`, createErr);
        }
      } else {
        this.logger.error(`Failed to connect to storage bucket "${this.bucketName}":`, err);
      }
    }

    await this.ensurePublicReadPolicy();
  }

  /**
   * Buckets (both real S3 and MinIO) are private-by-default: nothing under
   * them is publicly readable until a policy says otherwise. Scope public
   * GET access to ONLY the public-media prefixes so listing/profile/cover
   * images actually load in a browser, while KYC documents and chat
   * attachments remain unreachable without a signed URL. This never touches
   * remote/production infrastructure — it configures the bucket this
   * service itself already owns (local MinIO in dev).
   */
  private async ensurePublicReadPolicy() {
    const resources = PUBLIC_MEDIA_CATEGORIES.map((category) => `arn:aws:s3:::${this.bucketName}/${category}/*`);
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadForPublicMediaCategoriesOnly',
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: resources,
        },
      ],
    };

    try {
      await this.s3Client.send(
        new PutBucketPolicyCommand({ Bucket: this.bucketName, Policy: JSON.stringify(policy) }),
      );
      this.logger.log(
        `Public-read bucket policy applied for: ${PUBLIC_MEDIA_CATEGORIES.join(', ')}. All other categories (KYC, chat attachments) remain private and require signed URLs.`,
      );
    } catch (err) {
      // Fail closed: if the policy can't be applied, files simply stay
      // private (and public ones fall back to signed URLs via
      // resolveReadUrl) rather than risking anything becoming exposed.
      this.logger.error(`Failed to apply public-read bucket policy on "${this.bucketName}":`, err);
    }
  }

  isPublicCategory(category: string): boolean {
    return PUBLIC_MEDIA_CATEGORIES.includes(category);
  }

  /** The category is always the first path segment of a generated file key. */
  categoryFromKey(fileKey: string): string {
    return fileKey.split('/')[0];
  }

  /**
   * Turns a stored file key back into a URL a client can actually load:
   * a direct (bucket-policy-backed) URL for public categories, or a
   * freshly-generated short-lived signed GET URL for everything private.
   * Never persist the signed URL itself — always regenerate at read time.
   */
  async resolveReadUrl(fileKey: string, category?: string): Promise<string> {
    const cat = category || this.categoryFromKey(fileKey);
    if (this.isPublicCategory(cat)) {
      const endpoint = this.configService.get<string>('S3_ENDPOINT', 'http://localhost:9000');
      return endpoint
        ? `${endpoint}/${this.bucketName}/${fileKey}`
        : `https://${this.bucketName}.s3.amazonaws.com/${fileKey}`;
    }
    return this.getSignedReadUrl(fileKey);
  }

  /**
   * Given a previously-stored direct S3/MinIO URL (e.g. chat attachments,
   * which are keyed by URL rather than a MediaFile row), extracts the
   * object key so it can be re-resolved via resolveReadUrl. Returns null
   * if the URL doesn't point into our own bucket.
   */
  extractKeyFromUrl(url: string): string | null {
    if (!url) return null;
    const marker = `/${this.bucketName}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    try {
      return decodeURIComponent(url.slice(idx + marker.length));
    } catch {
      return url.slice(idx + marker.length);
    }
  }

  /** Convenience wrapper: re-resolves a stored URL, signing it if private. */
  async resolveUrlForDisplay(url: string): Promise<string> {
    const key = this.extractKeyFromUrl(url);
    if (!key) return url; // not one of our objects — leave untouched
    return this.resolveReadUrl(key);
  }

  async getSignedReadUrl(fileKey: string, expiresIn = 900): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async generatePresignedUploadUrl(
    userId: string,
    fileName: string,
    category: string,
    fileType: string,
  ): Promise<{ uploadUrl: string; fileKey: string; fileUrl: string }> {
    const extension = fileName.split('.').pop() || 'bin';
    const fileKey = `${category}/${userId}/${randomUUID()}.${extension}`;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    
    // Construct local-accessible direct file URL
    const endpoint = this.configService.get<string>('S3_ENDPOINT', 'http://localhost:9000');
    const fileUrl = endpoint 
      ? `${endpoint}/${this.bucketName}/${fileKey}`
      : `https://${this.bucketName}.s3.amazonaws.com/${fileKey}`;

    return { uploadUrl, fileKey, fileUrl };
  }

  async uploadBuffer(buffer: Buffer, fileKey: string, mimeType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      Body: buffer,
      ContentType: mimeType,
    });
    await this.s3Client.send(command);
    const endpoint = this.configService.get<string>('S3_ENDPOINT', 'http://localhost:9000');
    return endpoint 
      ? `${endpoint}/${this.bucketName}/${fileKey}`
      : `https://${this.bucketName}.s3.amazonaws.com/${fileKey}`;
  }

  async deleteFile(fileKey: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });
      await this.s3Client.send(command);
      this.logger.log(`Deleted file key ${fileKey} from S3.`);
    } catch (err) {
      this.logger.error(`Failed to delete S3 file key ${fileKey}:`, err);
    }
  }
}
