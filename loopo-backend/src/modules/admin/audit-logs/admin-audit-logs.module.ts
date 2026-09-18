import { Module } from '@nestjs/common';
import { AdminAuditLogsController } from './admin-audit-logs.controller';

// AuditLogsService comes from the @Global() AuditLogsModule
// (src/modules/audit-logs) - no need to import it here.
@Module({
  controllers: [AdminAuditLogsController],
})
export class AdminAuditLogsModule {}
