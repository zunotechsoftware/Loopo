import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ReputationService } from '../services/reputation.service';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Public } from '../../../shared/common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Ratings & Reputation')
@Controller()
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class ReputationController {
  constructor(private readonly reputationService: ReputationService) {}

  @Public()
  @ApiOperation({ summary: 'Get user reputation, seller/buyer stats, and trust score' })
  @ApiResponse({ status: 200, description: 'User rating data' })
  @Get('users/:id/rating')
  async getUserRating(@Param('id') id: string) {
    return this.reputationService.getUserRating(id);
  }

  @Public()
  @ApiOperation({ summary: 'Get product average rating and review count' })
  @ApiResponse({ status: 200, description: 'Product rating data' })
  @Get('products/:id/rating')
  async getProductRating(@Param('id') id: string) {
    return this.reputationService.getProductRating(id);
  }
}
