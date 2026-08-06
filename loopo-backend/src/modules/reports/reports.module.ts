import { Module } from '@nestjs/common';
import { ReportsController } from './controllers/reports.controller';
import { AdminReportsController } from './controllers/admin-reports.controller';
import { ReportsService } from './services/reports.service';
import { ReportsRepository } from './repositories/reports.repository';

@Module({
  controllers: [ReportsController, AdminReportsController],
  providers: [ReportsService, ReportsRepository],
  exports: [ReportsService, ReportsRepository],
})
export class ReportsModule {}
