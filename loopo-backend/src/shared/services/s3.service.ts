import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

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
