import { SetMetadata } from '@nestjs/common';

export const AUDIT_LOG_KEY = 'audit_log';

export interface AuditLogOptions {
  action: string;
  entity: string;
}

export const LogAudit = (action: string, entity: string) =>
  SetMetadata(AUDIT_LOG_KEY, { action, entity });
