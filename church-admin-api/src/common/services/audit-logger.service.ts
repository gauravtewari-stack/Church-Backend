import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';

export interface AuditLogInput {
  churchId: string;
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLoggerService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Log an audit event
   * @param input Audit log input with all required and optional fields
   */
  async log(input: AuditLogInput): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      church_id: input.churchId,
      user_id: input.userId,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId,
      changes: input.changes || null,
      ip_address: input.ipAddress || null,
      user_agent: input.userAgent || null,
    });

    return this.auditLogRepository.save(auditLog);
  }

  /**
   * Log entity creation
   */
  async logCreate(
    churchId: string,
    userId: string,
    entityType: string,
    entityId: string,
    newValues: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      churchId,
      userId,
      action: AuditAction.CREATE,
      entityType,
      entityId,
      changes: { new: newValues },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log entity update
   */
  async logUpdate(
    churchId: string,
    userId: string,
    entityType: string,
    entityId: string,
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      churchId,
      userId,
      action: AuditAction.UPDATE,
      entityType,
      entityId,
      changes: { old: oldValues, new: newValues },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log entity deletion
   */
  async logDelete(
    churchId: string,
    userId: string,
    entityType: string,
    entityId: string,
    oldValues?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      churchId,
      userId,
      action: AuditAction.DELETE,
      entityType,
      entityId,
      changes: oldValues ? { old: oldValues } : null,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log entity restore
   */
  async logRestore(
    churchId: string,
    userId: string,
    entityType: string,
    entityId: string,
    values?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      churchId,
      userId,
      action: AuditAction.RESTORE,
      entityType,
      entityId,
      changes: values ? { new: values } : null,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log entity publish
   */
  async logPublish(
    churchId: string,
    userId: string,
    entityType: string,
    entityId: string,
    values?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      churchId,
      userId,
      action: AuditAction.PUBLISH,
      entityType,
      entityId,
      changes: values ? { new: values } : null,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log entity archive
   */
  async logArchive(
    churchId: string,
    userId: string,
    entityType: string,
    entityId: string,
    values?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      churchId,
      userId,
      action: AuditAction.ARCHIVE,
      entityType,
      entityId,
      changes: values ? { new: values } : null,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Get audit history for an entity
   */
  async getEntityHistory(
    churchId: string,
    entityType: string,
    entityId: string,
    limit: number = 50,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: {
        church_id: churchId,
        entity_type: entityType,
        entity_id: entityId,
      },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get audit history for a user
   */
  async getUserActivity(
    churchId: string,
    userId: string,
    limit: number = 50,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: {
        church_id: churchId,
        user_id: userId,
      },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get audit history for a church
   */
  async getChurchActivity(churchId: string, limit: number = 100): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { church_id: churchId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get activity by action type
   */
  async getActivityByAction(
    churchId: string,
    action: AuditAction,
    limit: number = 50,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: {
        church_id: churchId,
        action,
      },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get changes between two timestamps
   */
  async getChangesBetween(
    churchId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository
      .createQueryBuilder('audit')
      .where('audit.church_id = :churchId', { churchId })
      .andWhere('audit.created_at >= :startDate', { startDate })
      .andWhere('audit.created_at <= :endDate', { endDate })
      .orderBy('audit.created_at', 'DESC')
      .getMany();
  }

  /**
   * Compare versions of an entity
   */
  async getVersionHistory(
    churchId: string,
    entityType: string,
    entityId: string,
  ): Promise<Array<{ version: number; changes: Record<string, any>; action: string; date: Date }>> {
    const logs = await this.getEntityHistory(churchId, entityType, entityId, 100);

    return logs.reverse().map((log, index) => ({
      version: index + 1,
      changes: log.changes || {},
      action: log.action,
      date: log.created_at,
    }));
  }
}
