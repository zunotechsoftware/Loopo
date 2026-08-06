import { Module } from '@nestjs/common';
import { SellerProfileController } from './controllers/seller-profile.controller';
import { SellerProfileService } from './services/seller-profile.service';
import { SellerProfileRepository } from './repositories/seller-profile.repository';
import { SellerProfileListener } from './listeners/seller-profile.listener';
import { PrismaModule } from '../../shared/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SellerProfileController],
  providers: [
    SellerProfileService,
    SellerProfileRepository,
    SellerProfileListener,
  ],
  exports: [SellerProfileService, SellerProfileRepository],
})
export class SellerProfileModule {}
