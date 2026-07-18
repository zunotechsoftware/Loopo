import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AUDIT_LOG_KEY, AuditLogOptions } from '../decorators/audit-log.decorator';
import { AuditLogsService } from '../../../modules/audit-logs/services/audit-logs.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditOptions = this.reflector.getAllAndOverride<AuditLogOptions>(
      AUDIT_LOG_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { user, method, ip, body, params } = request;
    const userAgent = request.headers['user-agent'] || 'unknown';

    return next.handle().pipe(
      tap(async (response) => {
        // Asynchronously log the audit trail without blocking response completion
        const userId = user?.id || null;
        const entityId = params?.id || body?.id || null;

        let oldValues: any = null;
        let newValues: any = null;

        if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
          // Extract sensitive password inputs out of audit logs
          const { password, passwordConfirm, ...cleanBody } = body;
          newValues = cleanBody;
        }

        await this.auditLogsService.logAction({
          userId,
          action: auditOptions.action,
          entity: auditOptions.entity,
          entityId,
          ipAddress: ip,
          userAgent,
          oldValues,
          newValues,
          createdBy: userId,
        });
      }),
    );
  }
}
