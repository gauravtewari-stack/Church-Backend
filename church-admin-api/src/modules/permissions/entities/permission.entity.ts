import { Entity, Column, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserRole, PermissionAction } from '../../../common/enums';

@Entity('permissions')
@Unique(['role', 'module', 'action', 'church_id'])
@Index(['role', 'church_id'])
@Index(['module', 'church_id'])
export class Permission extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  role: UserRole;

  @Column({ type: 'varchar', length: 100 })
  module: string;

  @Column({ type: 'varchar', length: 50 })
  action: PermissionAction;

  @Column({ type: 'text', nullable: true })
  description: string;
}
