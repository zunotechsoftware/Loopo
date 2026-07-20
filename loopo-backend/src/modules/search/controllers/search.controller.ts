import { Controller, Get, Delete, Query, UseGuards, Request, Param, Ip, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from '../services/search.service';
import { SearchQueryDto, AutocompleteQueryDto } from '../dto/search.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { Public } from '../../../shared/common/decorators/public.decorator';

@ApiTags('Search Operations')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Perform a full-text search with geo radius and attributes filters' })
  @ApiResponse({ status: 200, description: 'Matched listings result.' })
  async search(
    @Query() queryDto: SearchQueryDto,
    @Request() req: any,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const userId = req.user?.id || null;

    // Parse dynamic attributes from query string JSON if provided
    let attributesParsed = undefined;
    if (queryDto.attributes) {
      try {
        attributesParsed = JSON.parse(queryDto.attributes);
      } catch (e) {
        // Ignore or throw error
      }
    }

    const filters = {
      categoryId: queryDto.categoryId,
      subcategoryId: queryDto.subcategoryId,
      condition: queryDto.condition,
      minPrice: queryDto.minPrice,
      maxPrice: queryDto.maxPrice,
      currency: queryDto.currency,
      city: queryDto.city,
      latitude: queryDto.latitude,
      longitude: queryDto.longitude,
      radiusKm: queryDto.radiusKm,
      sellerId: queryDto.sellerId,
      isFeatured: queryDto.isFeatured,
      isBoosted: queryDto.isBoosted,
      datePosted: queryDto.datePosted,
      attributes: attributesParsed,
    };

    const pagination = {
      page: queryDto.page,
      limit: queryDto.limit,
      sortBy: queryDto.sortBy,
      sortOrder: queryDto.sortOrder,
    };

    const results = await this.searchService.executeSearch(
      queryDto.query || '',
      filters,
      pagination,
      userId,
      ipAddress,
      userAgent,
    );

    return { message: 'Search execution completed successfully', data: results };
  }

  @Get('suggestions')
  @Public()
  @ApiOperation({ summary: 'Retrieve keyword suggestions for autocomplete' })
  async getSuggestions(@Query() dto: AutocompleteQueryDto) {
    const suggestions = await this.searchService.getSuggestions(dto.query);
    return { message: 'Autocomplete suggestions retrieved successfully', data: suggestions };
  }

  @Get('trending')
  @Public()
  @ApiOperation({ summary: 'Retrieve trending marketplace searches' })
  async getTrending() {
    const trending = await this.searchService.getTrendingSearches();
    return { message: 'Trending searches retrieved successfully', data: trending };
  }

  @Get('recent')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('search.view')
  @ApiOperation({ summary: 'Get user recent search queries' })
  async getRecent(@Request() req: any) {
    const history = await this.searchService.getRecentSearches(req.user.id);
    return { message: 'Recent search history retrieved successfully', data: history };
  }

  @Delete('recent')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('favorites.manage') // Or search.manage/interactions
  @ApiOperation({ summary: 'Clear entire search history logs' })
  async clearRecent(@Request() req: any) {
    await this.searchService.clearRecentSearches(req.user.id);
    return { message: 'Recent searches cleared successfully', data: {} };
  }

  @Delete('recent/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('favorites.manage')
  @ApiOperation({ summary: 'Delete one recent search history record' })
  async deleteRecentItem(@Param('id') id: string, @Request() req: any) {
    await this.searchService.deleteOneRecentSearch(req.user.id, id);
    return { message: 'Search log record deleted successfully', data: {} };
  }
}
