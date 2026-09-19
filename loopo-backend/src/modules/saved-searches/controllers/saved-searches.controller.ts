import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { SavedSearchesService } from '../services/saved-searches.service';
import { CreateSavedSearchDto, UpdateSavedSearchDto } from '../dto/saved-search.dto';

@ApiTags('Saved Searches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('saved-searches')
export class SavedSearchesController {
  constructor(private readonly savedSearchesService: SavedSearchesService) {}

  @Get()
  findMine(@Request() req: any) {
    return this.savedSearchesService.findMine(req.user.id);
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateSavedSearchDto) {
    return this.savedSearchesService.create(req.user.id, dto);
  }

  @Patch(':id')
  updateNotifications(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateSavedSearchDto) {
    return this.savedSearchesService.updateNotifications(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.savedSearchesService.remove(req.user.id, id);
  }
}
