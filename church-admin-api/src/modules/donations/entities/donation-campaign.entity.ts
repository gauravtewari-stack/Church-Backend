import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { ContentStatus } from '../../../common/enums';

@Entity('donation_campaigns')
@Index(['church_id', 'status', 'deleted_at'])
@Index(['church_id', 'start_date', 'end_date'])
@Index(['slug'])
@Index(['linked_event_id'])
export class DonationCampaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  church_id: string;

  @Column('varchar', { length: 500 })
  title: string;

  @Column('varchar', { length: 500 })
  slug: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ type: 'real', nullable: true })
  target_amount: number;

  @Column({ type: 'real', default: 0 })
  current_amount: number;

  @Column('varchar', { length: 3, default: 'USD' })
  currency: string;

  @Column('varchar', { length: 500, nullable: true })
  featured_image_url: string;

  @Column({ type: 'varchar', length: 50, default: ContentStatus.DRAFT })
  status: ContentStatus;

  @Column({ type: 'datetime' })
  start_date: Date;

  @Column({ type: 'datetime', nullable: true })
  end_date: Date;

  @Column({ type: 'varchar', length: 36, nullable: true })
  linked_event_id: string;

  @Column('varchar', { length: 50, nullable: true })
  payment_provider: string; // 'stripe' | 'paypal' | 'none'

  @Column({ type: 'simple-json', nullable: true })
  payment_provider_config: Record<string, any>;

  @Column('boolean', { default: false })
  is_recurring_enabled: boolean;

  @Column({ type: 'datetime', nullable: true })
  published_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;

  @Column({ type: 'varchar', length: 36, nullable: true })
  created_by: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  updated_by: string;
}
