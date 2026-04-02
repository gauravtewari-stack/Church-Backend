import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserRole } from '../../../common/enums';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['church_id', 'email'])
@Index(['church_id', 'status'])
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 50, default: UserRole.EDITOR })
  role: UserRole;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string; // 'active' | 'inactive' | 'suspended'

  @Column({ type: 'varchar', length: 255, nullable: true })
  last_login: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar_url: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;
}
