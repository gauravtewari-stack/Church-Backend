import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { PaymentStatus, PaymentMethod } from '../../../common/enums';

@Entity('donation_transactions')
@Index(['church_id', 'campaign_id'])
@Index(['church_id', 'created_at'])
@Index(['church_id', 'status'])
@Index(['transaction_id'])
@Index(['donor_email'])
export class DonationTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  church_id: string;

  @Column({ type: 'varchar', length: 36 })
  campaign_id: string;

  @Column('varchar', { length: 255 })
  donor_name: string;

  @Column('varchar', { length: 255 })
  donor_email: string;

  @Column({ type: 'real' })
  amount: number;

  @Column('varchar', { length: 3 })
  currency: string;

  @Column('varchar', { length: 50 })
  payment_method: string; // Enum of PaymentMethod

  @Column('varchar', { length: 50 })
  payment_provider: string; // 'stripe' | 'paypal' | 'cash' | 'check' | 'bank_transfer' | 'other'

  @Column('varchar', { length: 255, nullable: true })
  transaction_id: string; // From payment provider

  @Column('varchar', { length: 50, default: PaymentStatus.PENDING })
  status: string; // PaymentStatus enum

  @Column('boolean', { default: false })
  is_anonymous: boolean;

  @Column('boolean', { default: false })
  is_recurring: boolean;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>; // Store additional data like recurring frequency, next charge date, etc.

  @CreateDateColumn()
  created_at: Date;
}
