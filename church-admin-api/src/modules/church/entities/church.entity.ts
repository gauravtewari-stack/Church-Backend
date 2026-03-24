import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { v4 as uuid } from 'uuid';

export enum PlanType {
  FREE = 'free',
  GROWTH = 'growth',
  PRO = 'pro',
}

export interface ChurchSettings {
  max_sermons?: number;
  max_events?: number;
  max_storage_mb?: number;
  features_enabled?: string[];
}

@Entity('churches')
@Index(['slug'], { unique: true })
@Index(['email'])
@Index(['is_active'])
@Index(['plan'])
@Index(['deleted_at'])
export class Church {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo_url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  website_url: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  zip_code: string;

  @Column({ type: 'varchar', length: 50, default: 'UTC' })
  timezone: string = 'UTC';

  @Column({ type: 'varchar', length: 7, nullable: true })
  primary_color: string;

  @Column({ type: 'varchar', length: 7, nullable: true })
  secondary_color: string;

  @Column({ type: 'varchar', length: 50, default: PlanType.FREE })
  plan: PlanType = PlanType.FREE;

  @Column({ type: 'datetime', nullable: true })
  plan_expires_at: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean = true;

  @Column({
    type: 'simple-json',
    nullable: true,
  })
  settings: ChurchSettings;

  @Column({ type: 'boolean', default: false })
  onboarding_completed: boolean = false;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;

  constructor(partial?: Partial<Church>) {
    Object.assign(this, partial);
  }
}
