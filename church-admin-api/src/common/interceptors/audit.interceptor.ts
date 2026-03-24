import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { AuditAction, AuditEntityType } from '../enums';

interface AuditLog {
  id?: string;
  user_id?: string;
  church_id?: string;
  entity_type: AuditEntityType;
  entity_id: string;
  action: AuditAction;
  method: string;
  path: string;
  status_code?: number;
  changes?: Record<string, any>;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address: string;
  user_agent: string;
  timestamp: Date;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);
  private readonly crudMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const now = Date.now();

    // Only log CRUD operations
    if (!this.crudMethods.includes(request.method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(
        (data) => {
          const duration = Date.now() - now;
          this.logAuditTrail(request, response, data, duration);
        },
        (error) => {
          const duration = Date.now() - now;
          this.logAuditTrail(request, response, null, duration, error);
        },
      ),
    );
  }

  private logAuditTrail(
    request: Request,
    response: Response,
    responseData: any,
    duration: number,
    error?: any,
  ) {
    try {
      const auditLog = this.buildAuditLog(request, response, responseData, error);

      // Log to console in development
      if (process.env.NODE_ENV !== 'production') {
        this.logger.debug(
          `[AUDIT] ${auditLog.action} ${auditLog.entity_type} - ${duration}ms`,
          JSON.stringify(auditLog),
        );
      }

      // TODO: Send to audit log service/queue
      // this.auditService.log(auditLog);
      // OR queue it for async processing
      // this.auditQueue.add(auditLog);

      // Log to file in production
      if (process.env.NODE_ENV === 'production') {
        this.logger.log(
          `[AUDIT] ${auditLog.action} ${auditLog.entity_type} | ${auditLog.user_id || 'SYSTEM'} | ${auditLog.ip_address}`,
        );
      }
    } catch (err) {
      this.logger.error('Failed to log audit trail', err);
    }
  }

  private buildAuditLog(
    request: Request,
    response: Response,
    responseData: any,
    error?: any,
  ): AuditLog {
    const action = this.getAction(request.method);
    const { entityType, entityId } = this.extractEntityInfo(request);
    const userId = (request as any).user?.id;
    const churchId = (request as any).user?.church_id || request.headers['x-church-id'];

    return {
      user_id: userId,
      church_id: churchId as string,
      entity_type: entityType,
      entity_id: entityId,
      action,
      method: request.method,
      path: request.url,
      status_code: error ? undefined : response.statusCode,
      ip_address: this.getClientIp(request),
      user_agent: request.headers['user-agent'] || 'Unknown',
      timestamp: new Date(),
    };
  }

  private getAction(method: string): AuditAction {
    switch (method) {
      case 'POST':
        return AuditAction.CREATE;
      case 'PUT':
      case 'PATCH':
        return AuditAction.UPDATE;
      case 'DELETE':
        return AuditAction.DELETE;
      default:
        return AuditAction.READ;
    }
  }

  private extractEntityInfo(
    request: Request,
  ): { entityType: AuditEntityType; entityId: string } {
    const pathParts = request.path.split('/').filter((p) => p);

    // Extract entity type from path (e.g., /api/v1/users/:id -> USER)
    let entityType = AuditEntityType.SETTINGS;
    const primaryPath = pathParts[2]?.toLowerCase();

    const entityMap: Record<string, AuditEntityType> = {
      users: AuditEntityType.USER,
      churches: AuditEntityType.CHURCH,
      contents: AuditEntityType.CONTENT,
      media: AuditEntityType.MEDIA,
      donations: AuditEntityType.DONATION,
      events: AuditEntityType.EVENT,
      sermons: AuditEntityType.SERMON,
      members: AuditEntityType.MEMBER,
      settings: AuditEntityType.SETTINGS,
    };

    if (primaryPath && entityMap[primaryPath]) {
      entityType = entityMap[primaryPath];
    }

    // Extract entity ID from path (e.g., /api/v1/users/:id)
    const entityId = pathParts[3] || 'unknown';

    return { entityType, entityId };
  }

  private getClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return request.ip || request.socket.remoteAddress || 'unknown';
  }
}
