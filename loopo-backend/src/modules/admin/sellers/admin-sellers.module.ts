import { Module } from '@nestjs/common';
import { AdminSellersController } from './admin-sellers.controller';
import { AdminSellersService } from './admin-sellers.service';
import { PrismaModule } from '../../../shared/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminSellersController],
  providers: [AdminSellersService],
  exports: [AdminSellersService],
})
export class AdminSellersModule {}
