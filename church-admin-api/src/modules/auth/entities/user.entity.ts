import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserRole } from '../../../common/enums';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['church_id', 'email'])
@Index(['church_id', 'is_active'])
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  first_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  last_name: string;

  @Column({ type: 'varchar', length: 50, default: UserRole.EDITOR })
  role: UserRole;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'datetime', nullable: true })
  last_login_at: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar_url: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  // Getter for full name
  get fullName(): string {
    return `${this.first_name || ''} ${this.last_name || ''}`.trim();
  }
}
