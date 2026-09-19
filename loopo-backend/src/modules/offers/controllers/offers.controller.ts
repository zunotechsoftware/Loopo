import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { OffersService } from '../services/offers.service';
import { CreateOfferDto } from '../dto/offer.dto';

@ApiTags('Offers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateOfferDto) {
    return this.offersService.createOffer(req.user.id, dto);
  }

  @Get('made')
  getMade(@Request() req: any) {
    return this.offersService.getMadeOffers(req.user.id);
  }

  @Get('received')
  getReceived(@Request() req: any) {
    return this.offersService.getReceivedOffers(req.user.id);
  }

  @Patch(':id/accept')
  accept(@Request() req: any, @Param('id') id: string) {
    return this.offersService.acceptOffer(req.user.id, id);
  }

  @Patch(':id/reject')
  reject(@Request() req: any, @Param('id') id: string) {
    return this.offersService.rejectOffer(req.user.id, id);
  }

  @Patch(':id/withdraw')
  withdraw(@Request() req: any, @Param('id') id: string) {
    return this.offersService.withdrawOffer(req.user.id, id);
  }
}
