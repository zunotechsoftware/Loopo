import { Controller, Get, Put, Delete, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { UpdateProfileDto } from '../dto/profile.dto';
import { GetUploadUrlDto, ConfirmUploadDto } from '../dto/image-upload.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { Public } from '../../../shared/common/decorators/public.decorator';
import { ForbiddenException } from '@nestjs/common';

@ApiTags('Users & Profile')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Get('me')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'CUSTOMER')
  @ApiOperation({ summary: 'Get current authenticated user details and profile' })
  @ApiResponse({ status: 200, description: 'Details retrieved successfully.' })
  async getMe(@Request() req: any) {
    const user = await this.usersService.findById(req.user.id);
    const profile = await this.usersService.getProfile(req.user.id);
    return {
      message: 'User details retrieved successfully',
      data: {
        ...user,
        profile,
      },
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Put('me')
  @Roles('SUPER_ADMIN', 'ADMIN', 'CUSTOMER')
  @ApiOperation({ summary: 'Update current user\'s profile details' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  async updateMe(@Body() dto: UpdateProfileDto, @Request() req: any) {
    const profile = await this.usersService.updateProfile(req.user.id, dto);
    return { message: 'Profile updated successfully', data: profile };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'CUSTOMER')
  @ApiOperation({ summary: 'Get a user\'s profile by ID' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Insufficient privileges.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    const isAdmin = req.user.roles.includes('SUPER_ADMIN') || req.user.roles.includes('ADMIN') || req.user.roles.includes('MODERATOR');
    const isOwner = req.user.id === id;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You do not have permission to view this profile');
    }

    const user = await this.usersService.findById(id);
    const profile = await this.usersService.getProfile(id);
    return {
      message: 'User retrieved successfully',
      data: {
        ...user,
        profile,
      },
    };
  }

  @Public()
  @Get('public/:id')
  @ApiOperation({ summary: 'Get public seller profile details by User ID' })
  @ApiResponse({ status: 200, description: 'Seller profile retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Seller not found.' })
  async getPublic(@Param('id') id: string) {
    const publicProfile = await this.usersService.getPublicProfile(id);
    return { message: 'Public profile retrieved successfully', data: publicProfile };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Delete('me')
  @Roles('SUPER_ADMIN', 'ADMIN', 'CUSTOMER')
  @ApiOperation({ summary: 'Soft delete current user\'s account' })
  @ApiResponse({ status: 200, description: 'Account deactivated successfully.' })
  async deleteMe(@Request() req: any) {
    await this.usersService.delete(req.user.id);
    return { message: 'Account deleted successfully', data: {} };
  }

  // --- Profile Picture Upload ---
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Post('profile-image/upload-url')
  @Roles('SUPER_ADMIN', 'ADMIN', 'CUSTOMER')
  @ApiOperation({ summary: 'Request signed S3 upload URL for profile picture' })
  @ApiResponse({ status: 201, description: 'Signed upload URL generated successfully.' })
  async getProfileImageUploadUrl(@Body() dto: GetUploadUrlDto, @Request() req: any) {
    const data = await this.usersService.getUploadUrl(req.user.id, dto.fileName, dto.fileType, dto.fileSize, 'PROFILE_IMAGE');
    return { message: 'Upload URL generated successfully', data };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Post('profile-image')
  @Roles('SUPER_ADMIN', 'ADMIN', 'CUSTOMER')
  @ApiOperation({ summary: 'Confirm upload and set uploaded image as profile picture' })
  @ApiResponse({ status: 201, description: 'Profile picture updated successfully.' })
  async confirmProfileImageUpload(@Body() dto: ConfirmUploadDto, @Request() req: any) {
    await this.usersService.confirmImageUpload(req.user.id, dto.mediaId, 'PROFILE_IMAGE');
    return { message: 'Profile picture updated successfully', data: {} };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Delete('profile-image')
  @Roles('SUPER_ADMIN', 'ADMIN', 'CUSTOMER')
  @ApiOperation({ summary: 'Delete current profile picture' })
  @ApiResponse({ status: 200, description: 'Profile picture deleted successfully.' })
  async deleteProfileImage(@Request() req: any) {
    await this.usersService.deleteImage(req.user.id, 'PROFILE_IMAGE');
    return { message: 'Profile picture deleted successfully', data: {} };
  }

  // --- Cover Image Upload ---
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Post('cover-image/upload-url')
  @Roles('SUPER_ADMIN', 'ADMIN', 'CUSTOMER')
  @ApiOperation({ summary: 'Request signed S3 upload URL for cover image' })
  @ApiResponse({ status: 201, description: 'Signed upload URL generated successfully.' })
  async getCoverImageUploadUrl(@Body() dto: GetUploadUrlDto, @Request() req: any) {
    const data = await this.usersService.getUploadUrl(req.user.id, dto.fileName, dto.fileType, dto.fileSize, 'COVER_IMAGE');
    return { message: 'Upload URL generated successfully', data };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Post('cover-image')
  @Roles('SUPER_ADMIN', 'ADMIN', 'CUSTOMER')
  @ApiOperation({ summary: 'Confirm upload and set uploaded image as cover picture' })
  @ApiResponse({ status: 201, description: 'Cover picture updated successfully.' })
  async confirmCoverImageUpload(@Body() dto: ConfirmUploadDto, @Request() req: any) {
    await this.usersService.confirmImageUpload(req.user.id, dto.mediaId, 'COVER_IMAGE');
    return { message: 'Cover picture updated successfully', data: {} };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Delete('cover-image')
  @Roles('SUPER_ADMIN', 'ADMIN', 'CUSTOMER')
  @ApiOperation({ summary: 'Delete current cover image' })
  @ApiResponse({ status: 200, description: 'Cover picture deleted successfully.' })
  async deleteCoverImage(@Request() req: any) {
    await this.usersService.deleteImage(req.user.id, 'COVER_IMAGE');
    return { message: 'Cover picture deleted successfully', data: {} };
  }
}
