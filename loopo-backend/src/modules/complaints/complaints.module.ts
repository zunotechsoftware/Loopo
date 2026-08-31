import { Module } from '@nestjs/common';
import { ComplaintsService } from './services/complaints.service';
import { AdminComplaintsController } from './controllers/admin-complaints.controller';
import { PrismaModule } from '../../shared/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminComplaintsController],
  providers: [ComplaintsService],
  exports: [ComplaintsService],
})
export class ComplaintsModule {}
