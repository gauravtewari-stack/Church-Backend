import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from './user.entity';

@Entity('refresh_tokens')
@Index(['user_id'])
@Index(['token'], { unique: true })
@Index(['expires_at'])
export class RefreshToken extends BaseEntity {
  @Column({ type: 'varchar', length: 36 })
  user_id: string;

  @Column({ type: 'text' })
  token: string;

  @Column({ type: 'datetime' })
  expires_at: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ip_address: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  user_agent: string;

  @Column({ type: 'boolean', default: false })
  is_revoked: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Check if token is still valid
  isValid(): boolean {
    return !this.is_revoked && this.expires_at > new Date();
  }
}
