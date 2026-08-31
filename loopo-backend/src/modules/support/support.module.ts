import { Module } from '@nestjs/common';
import { SupportService } from './services/support.service';
import { AdminSupportController } from './controllers/admin-support.controller';
import { PrismaModule } from '../../shared/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminSupportController],
  providers: [SupportService],
  exports: [SupportService],
})
export class SupportModule {}
