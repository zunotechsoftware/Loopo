import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { Prisma, Provider } from '@prisma/client';
import { RedisService } from '../../../shared/redis/redis.service';
import { S3Service } from '../../../shared/services/s3.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UpdateProfileDto } from '../dto/profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly redisService: RedisService,
    private readonly s3Service: S3Service,
    @InjectQueue('profile-image-processing') private readonly profileImageQueue: Queue,
  ) {}

  // --- Core User Operations ---
  async findById(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.flattenUserRoles(user);
  }

  async findByEmail(email: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) return null;
    return this.flattenUserRoles(user);
  }

  async findByPhone(phone: string) {
    const user = await this.usersRepository.findByPhone(phone);
    if (!user) return null;
    return this.flattenUserRoles(user);
  }

  async findByProvider(provider: Provider, providerId: string) {
    const user = await this.usersRepository.findByProvider(provider, providerId);
    if (!user) return null;
    return this.flattenUserRoles(user);
  }

  async create(data: Prisma.UserCreateInput, roles: string[] = ['USER']) {
    const user = await this.usersRepository.create(data, roles);
    return this.flattenUserRoles(user);
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    const user = await this.usersRepository.update(id, data);
    await this.redisService.del(`user:profile:${id}`);
    return this.flattenUserRoles(user);
  }

  async delete(id: string) {
    await this.usersRepository.delete(id);
    await this.redisService.del(`user:profile:${id}`);
    return { success: true };
  }

  // --- Profile Operations ---
  async getProfile(userId: string) {
    const cacheKey = `user:profile:${userId}`;
    
    // Check Cache
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.error('Redis error getting user profile:', err);
    }

    // Cache Miss
    const profile = await this.usersRepository.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException(`Profile for user ${userId} not found`);
    }

    // Save to Cache
    try {
      await this.redisService.set(cacheKey, JSON.stringify(profile), 86400); // 24h TTL
    } catch (err) {
      console.error('Redis error setting user profile:', err);
    }

    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const profile = await this.usersRepository.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException(`Profile for user ${userId} not found`);
    }

    // Map object correctly for Prisma
    const prismaUpdate: Prisma.ProfileUpdateInput = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      displayName: dto.displayName,
      bio: dto.bio,
      email: dto.email,
      phone: dto.phone,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      gender: dto.gender,
      country: dto.country,
      state: dto.state,
      city: dto.city,
      zipCode: dto.zipCode,
      preferredLanguage: dto.preferredLanguage,
      timezone: dto.timezone,
      website: dto.website,
      socialLinks: dto.socialLinks ? (dto.socialLinks as any) : undefined,
    };

    // Update Profile
    const updatedProfile = await this.usersRepository.updateProfile(userId, prismaUpdate);

    // Recalculate Completion Percentage
    const completion = this.calculateProfileCompletion(updatedProfile);
    const finalizedProfile = await this.usersRepository.updateProfile(userId, {
      profileCompletionPercentage: completion,
    });

    // Invalidate Cache
    await this.redisService.del(`user:profile:${userId}`);

    return finalizedProfile;
  }

  calculateProfileCompletion(profile: any): number {
    const fields = [
      'firstName',
      'lastName',
      'displayName',
      'bio',
      'email',
      'phone',
      'dateOfBirth',
      'gender',
      'country',
      'state',
      'city',
      'zipCode',
      'preferredLanguage',
      'timezone',
      'website',
      'profileImageId',
      'coverImageId',
    ];
    let filled = 0;
    for (const f of fields) {
      if (profile[f] !== null && profile[f] !== undefined && profile[f] !== '') {
        filled++;
      }
    }
    return Math.round((filled / fields.length) * 100);
  }

  // --- S3 Presigned Upload Url and Confirm ---
  async getUploadUrl(userId: string, fileName: string, fileType: string, fileSize: number, category: string) {
    // Validate file size (max 5MB for profile/cover images)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (fileSize > MAX_SIZE) {
      throw new BadRequestException('File size exceeds the 5MB limit');
    }

    // Generate signed upload URL from S3 Service
    const { uploadUrl, fileKey, fileUrl } = await this.s3Service.generatePresignedUploadUrl(
      userId,
      fileName,
      category,
      fileType,
    );

    // Create a PENDING MediaFile entry in database
    const media = await this.usersRepository.createMediaFile(userId, {
      fileName: fileKey,
      fileUrl,
      fileSize,
      mimeType: fileType,
      category,
      status: 'PENDING',
    });

    return {
      uploadUrl,
      fileKey,
      mediaId: media.id,
    };
  }

  async confirmImageUpload(userId: string, mediaId: string, category: string) {
    const media = await this.usersRepository.findMediaFileById(mediaId);
    if (!media) {
      throw new NotFoundException(`Media file with ID ${mediaId} not found`);
    }

    if (media.userId !== userId) {
      throw new ForbiddenException('You do not own this media file');
    }

    if (media.category !== category) {
      throw new BadRequestException(`Media category mismatch. Expected ${category}`);
    }

    // Update media status
    await this.usersRepository.updateMediaFile(mediaId, { status: 'PROCESSING' }, userId);

    // Associate image to User Profile
    const profileData: any = {};
    if (category === 'PROFILE_IMAGE') {
      profileData.profileImageId = mediaId;
    } else if (category === 'COVER_IMAGE') {
      profileData.coverImageId = mediaId;
    }

    const updatedProfile = await this.usersRepository.updateProfile(userId, profileData);

    // Recalculate Completion
    const completion = this.calculateProfileCompletion(updatedProfile);
    await this.usersRepository.updateProfile(userId, {
      profileCompletionPercentage: completion,
    });

    // Queue BullMQ job to perform S3 image optimization and generate thumbnails
    await this.profileImageQueue.add('process-image', {
      userId,
      mediaId,
      fileKey: media.fileName,
      category,
    });

    // Invalidate Cache
    await this.redisService.del(`user:profile:${userId}`);

    return { success: true };
  }

  async deleteImage(userId: string, category: string) {
    const profile = await this.usersRepository.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException(`Profile for user ${userId} not found`);
    }

    let mediaId: string | null = null;
    const updateData: any = {};

    if (category === 'PROFILE_IMAGE') {
      mediaId = profile.profileImageId;
      updateData.profileImageId = null;
    } else if (category === 'COVER_IMAGE') {
      mediaId = profile.coverImageId;
      updateData.coverImageId = null;
    }

    if (!mediaId) {
      throw new BadRequestException(`No ${category.toLowerCase().replace('_', ' ')} found to delete`);
    }

    const media = await this.usersRepository.findMediaFileById(mediaId);
    if (media) {
      // Delete object from S3
      await this.s3Service.deleteFile(media.fileName);
      // Soft delete media file entry
      await this.usersRepository.softDeleteMediaFile(mediaId, userId);
    }

    // Remove link from Profile
    const updatedProfile = await this.usersRepository.updateProfile(userId, updateData);

    // Recalculate Completion
    const completion = this.calculateProfileCompletion(updatedProfile);
    await this.usersRepository.updateProfile(userId, {
      profileCompletionPercentage: completion,
    });

    // Invalidate Cache
    await this.redisService.del(`user:profile:${userId}`);

    return { success: true };
  }

  // --- Public Profile Operations ---
  async getPublicProfile(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user || !user.profile) {
      throw new NotFoundException(`User profile with ID ${userId} not found`);
    }

    const { profile } = user;

    return {
      displayName: profile.displayName || 'Seller',
      profilePicture: profile.profileImage?.fileUrl || null,
      sellerRating: 4.8, // Mock seller rating
      memberSince: user.createdAt,
      verifiedBadge: profile.verifiedBadge,
      totalListings: 12, // Mock count
      completedSales: 5, // Mock count
      averageResponseTime: 'Within 1 hour', // Mock average
    };
  }

  // --- Helpers ---
  private flattenUserRoles(user: any) {
    if (!user) return null;
    const roles = user.roles.map((ur: any) => ur.role.name);
    const { roles: _, ...userWithoutRolesRelation } = user;
    return {
      ...userWithoutRolesRelation,
      roles,
    };
  }
}
