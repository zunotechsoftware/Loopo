import { Controller, Get, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RecommendationsService } from '../services/recommendations.service';
import { Public } from '../../../shared/common/decorators/public.decorator';

@ApiTags('Recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get personalized or fallback marketplace recommendations' })
  @ApiResponse({ status: 200, description: 'List of recommended listings.' })
  async getRecommendations(
    @Query('city') city?: string,
    @Query('limit') limit?: string,
    @Request() req?: any,
  ) {
    const userId = req.user?.id || null;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    
    const products = await this.recommendationsService.getPersonalizedRecommendations({
      userId,
      city,
      limit: parsedLimit,
    });

    return { message: 'Recommendations compiled successfully', data: products };
  }

  @Get('similar/:productId')
  @Public()
  @ApiOperation({ summary: 'Get listings similar to a specified product' })
  @ApiResponse({ status: 200, description: 'Matched similar products.' })
  async getSimilar(
    @Param('productId') productId: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 6;
    const products = await this.recommendationsService.getSimilarProducts(productId, parsedLimit);
    return { message: 'Similar listings retrieved successfully', data: products };
  }
}
