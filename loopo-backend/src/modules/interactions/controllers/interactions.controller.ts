import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InteractionsService } from '../services/interactions.service';
import { CreateWishlistDto, UpdateWishlistDto } from '../dto/interaction.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { LogAudit } from '../../../shared/common/decorators/audit-log.decorator';

@ApiTags('User Interactions (Favorites, Wishlists & History)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller()
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  // --- FAVORITES ---

  @Get('favorites')
  @Permissions('favorites.manage')
  @ApiOperation({ summary: 'Get list of favorite products' })
  async getFavorites(@Request() req: any) {
    const list = await this.interactionsService.getFavorites(req.user.id);
    return { message: 'Favorites retrieved successfully', data: list };
  }

  @Post('favorites/:productId')
  @Permissions('favorites.manage')
  @LogAudit('ADD_FAVORITE', 'Product')
  @ApiOperation({ summary: 'Add a product to favorites' })
  async addFavorite(@Param('productId') productId: string, @Request() req: any) {
    const result = await this.interactionsService.addFavorite(req.user.id, productId);
    return { message: 'Listing added to favorites successfully', data: result };
  }

  @Delete('favorites/:productId')
  @Permissions('favorites.manage')
  @LogAudit('REMOVE_FAVORITE', 'Product')
  @ApiOperation({ summary: 'Remove a product from favorites' })
  async removeFavorite(@Param('productId') productId: string, @Request() req: any) {
    const result = await this.interactionsService.removeFavorite(req.user.id, productId);
    return { message: 'Listing removed from favorites successfully', data: result };
  }

  // --- WISHLISTS ---

  @Get('wishlists')
  @Permissions('wishlist.manage')
  @ApiOperation({ summary: 'Get all user wishlists' })
  async getWishlists(@Request() req: any) {
    const list = await this.interactionsService.getWishlists(req.user.id);
    return { message: 'Wishlists retrieved successfully', data: list };
  }

  @Post('wishlists')
  @Permissions('wishlist.manage')
  @LogAudit('CREATE_WISHLIST', 'Wishlist')
  @ApiOperation({ summary: 'Create a custom wishlist' })
  async createWishlist(@Body() dto: CreateWishlistDto, @Request() req: any) {
    const wishlist = await this.interactionsService.createWishlist(req.user.id, dto);
    return { message: 'Wishlist created successfully', data: wishlist };
  }

  @Put('wishlists/:id')
  @Permissions('wishlist.manage')
  @LogAudit('UPDATE_WISHLIST', 'Wishlist')
  @ApiOperation({ summary: 'Update custom wishlist details' })
  async updateWishlist(
    @Param('id') id: string,
    @Body() dto: UpdateWishlistDto,
    @Request() req: any,
  ) {
    const wishlist = await this.interactionsService.updateWishlist(req.user.id, id, dto);
    return { message: 'Wishlist updated successfully', data: wishlist };
  }

  @Delete('wishlists/:id')
  @Permissions('wishlist.manage')
  @LogAudit('DELETE_WISHLIST', 'Wishlist')
  @ApiOperation({ summary: 'Delete custom wishlist (except default wishlist)' })
  async deleteWishlist(@Param('id') id: string, @Request() req: any) {
    const result = await this.interactionsService.deleteWishlist(req.user.id, id);
    return { message: 'Wishlist deleted successfully', data: result };
  }

  @Post('wishlists/:id/items/:productId')
  @Permissions('wishlist.manage')
  @LogAudit('ADD_WISHLIST_ITEM', 'Wishlist')
  @ApiOperation({ summary: 'Add product item to wishlist' })
  async addItem(
    @Param('id') wishlistId: string,
    @Param('productId') productId: string,
    @Request() req: any,
  ) {
    const result = await this.interactionsService.addItemToWishlist(req.user.id, wishlistId, productId);
    return { message: 'Listing added to wishlist successfully', data: result };
  }

  @Delete('wishlists/:id/items/:productId')
  @Permissions('wishlist.manage')
  @LogAudit('REMOVE_WISHLIST_ITEM', 'Wishlist')
  @ApiOperation({ summary: 'Remove product item from wishlist' })
  async removeItem(
    @Param('id') wishlistId: string,
    @Param('productId') productId: string,
    @Request() req: any,
  ) {
    const result = await this.interactionsService.removeItemFromWishlist(req.user.id, wishlistId, productId);
    return { message: 'Listing removed from wishlist successfully', data: result };
  }

  // --- RECENTLY VIEWED ---

  @Get('recently-viewed')
  @Permissions('favorites.manage')
  @ApiOperation({ summary: 'Get list of recently viewed products' })
  async getRecentlyViewed(@Request() req: any) {
    const list = await this.interactionsService.getRecentlyViewed(req.user.id);
    return { message: 'Recently viewed products retrieved successfully', data: list };
  }

  @Delete('recently-viewed')
  @Permissions('favorites.manage')
  @LogAudit('CLEAR_RECENTLY_VIEWED', 'User')
  @ApiOperation({ summary: 'Clear recently viewed products log history' })
  async clearRecentlyViewed(@Request() req: any) {
    const result = await this.interactionsService.clearRecentlyViewed(req.user.id);
    return { message: 'Recently viewed history cleared successfully', data: result };
  }
}
