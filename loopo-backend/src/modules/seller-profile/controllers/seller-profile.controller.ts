import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SellerProfileService } from '../services/seller-profile.service';
import { UpdateSellerProfileDto } from '../dto/seller-profile.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';

@ApiTags('Seller Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('seller')
export class SellerProfileController {
  constructor(private readonly service: SellerProfileService) {}

  @Get('profile')
  @Roles('USER')
  @ApiOperation({ summary: 'Get logged-in user\'s seller profile' })
  @ApiResponse({ status: 200, description: 'Seller profile retrieved successfully' })
  async getProfile(@Request() req: any) {
    return this.service.getProfile(req.user.id);
  }

  @Put('profile')
  @Roles('USER')
  @ApiOperation({ summary: 'Update logged-in user\'s seller profile' })
  @ApiResponse({ status: 200, description: 'Seller profile updated successfully' })
  async updateProfile(@Request() req: any, @Body() dto: UpdateSellerProfileDto) {
    return this.service.updateProfile(req.user.id, dto);
  }

  @Get('statistics')
  @Roles('USER')
  @ApiOperation({ summary: 'Get logged-in user\'s seller statistics' })
  @ApiResponse({ status: 200, description: 'Seller statistics retrieved successfully' })
  async getStatistics(@Request() req: any) {
    return this.service.getStatistics(req.user.id);
  }

  @Get('subscription')
  @Roles('USER')
  @ApiOperation({ summary: 'Get logged-in user\'s subscription status' })
  @ApiResponse({ status: 200, description: 'Seller subscription retrieved successfully' })
  async getSubscription(@Request() req: any) {
    return this.service.getSubscription(req.user.id);
  }
}
