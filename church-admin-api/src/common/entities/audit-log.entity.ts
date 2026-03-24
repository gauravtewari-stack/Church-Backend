import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  RESTORE = 'restore',
  PUBLISH = 'publish',
  ARCHIVE = 'archive',
}

@Entity('audit_logs')
@Index(['church_id', 'created_at'])
@Index(['entity_type', 'entity_id'])
@Index(['user_id', 'church_id'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  church_id: string;

  @Column({ type: 'varchar', length: 36 })
  user_id: string;

  @Column({ type: 'varchar', length: 50 })
  action: AuditAction;

  @Column('varchar', { length: 100 })
  entity_type: string;

  @Column({ type: 'varchar', length: 36 })
  entity_id: string;

  @Column({ type: 'simple-json', nullable: true })
  changes: Record<string, any> | null;

  @Column('varchar', { length: 50, nullable: true })
  ip_address: string | null;

  @Column('text', { nullable: true })
  user_agent: string | null;

  @CreateDateColumn()
  created_at: Date;
}
