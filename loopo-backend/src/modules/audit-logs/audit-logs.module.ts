import { Module, Global } from '@nestjs/common';
import { AuditLogsService } from './services/audit-logs.service';
import { AuditLogsRepository } from './repositories/audit-logs.repository';

@Global()
@Module({
  providers: [AuditLogsService, AuditLogsRepository],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}
