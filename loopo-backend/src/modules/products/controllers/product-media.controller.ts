import { Controller, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ProductsService } from '../services/products.service';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { LogAudit } from '../../../shared/common/decorators/audit-log.decorator';

// The global ValidationPipe runs with { whitelist: true, forbidNonWhitelisted:
// true } - a DTO class with no class-validator decorators at all has every
// property stripped/rejected regardless of what the client sends. These two
// classes had no decorators, so this endpoint 400'd on every real request
// ("property fileName should not exist") - nothing could ever upload a
// listing image or video through it.
export class PresignedUrlRequestDto {
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsNotEmpty()
  @IsString()
  fileType: string;
}

export class AttachMediaDto {
  @IsNotEmpty()
  @IsString()
  fileUrl: string;

  @IsNotEmpty()
  @IsString()
  fileKey: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

@ApiTags('Product Media Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller()
export class ProductMediaController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('products/:id/images/upload-url')
  @ApiOperation({ summary: 'Generate S3 presigned upload URL for a product image' })
  @ApiResponse({ status: 201, description: 'Presigned upload URL details generated.' })
  async getUploadUrl(
    @Param('id') productId: string,
    @Body() dto: PresignedUrlRequestDto,
    @Request() req: any,
  ) {
    const data = await this.productsService.generatePresignedMediaUrl(
      productId,
      dto.fileName,
      dto.fileType,
      req.user.id,
    );
    return { message: 'Presigned upload URL generated successfully', data };
  }

  @Post('products/:id/images')
  @LogAudit('ATTACH_PRODUCT_IMAGE', 'Product')
  @ApiOperation({ summary: 'Attach uploaded S3 image metadata to the listing' })
  async attachImage(
    @Param('id') productId: string,
    @Body() dto: AttachMediaDto,
  ) {
    const image = await this.productsService.attachImage(
      productId,
      dto.fileUrl,
      dto.fileKey,
      dto.sortOrder || 0,
    );
    return { message: 'Image attached successfully', data: image };
  }

  @Delete('products/images/:id')
  @LogAudit('DELETE_PRODUCT_IMAGE', 'Product')
  @ApiOperation({ summary: 'Remove an image from a listing' })
  async removeImage(@Param('id') imageId: string, @Request() req: any) {
    const result = await this.productsService.deleteImage(imageId, req.user.id);
    return { message: 'Image deleted successfully', data: result };
  }
}
