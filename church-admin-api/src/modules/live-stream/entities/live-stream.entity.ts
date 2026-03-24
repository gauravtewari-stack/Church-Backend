import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('live_streams')
@Index(['church_id'])
@Index(['slug', 'church_id'], { unique: true })
@Index(['status', 'church_id'])
@Index(['is_featured', 'church_id'])
@Index(['scheduled_at', 'church_id'])
@Index(['started_at', 'church_id'])
export class LiveStreamEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'varchar', length: 36 })
  church_id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 300, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500 })
  stream_url: string;

  @Column({ type: 'text', nullable: true })
  embed_code: string;

  @Column({ type: 'varchar', length: 50, default: 'custom' })
  platform: 'youtube' | 'facebook' | 'vimeo' | 'custom';

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnail_url: string;

  @Column({ type: 'datetime', nullable: true })
  scheduled_at: Date;

  @Column({ type: 'datetime', nullable: true })
  started_at: Date;

  @Column({ type: 'datetime', nullable: true })
  ended_at: Date;

  @Column({ type: 'varchar', length: 50, default: 'scheduled' })
  status: 'scheduled' | 'live' | 'ended' | 'archived';

  @Column({ type: 'varchar', length: 36, nullable: true })
  linked_event_id: string;

  @Column({ type: 'boolean', default: false })
  is_featured: boolean;

  @Column({ type: 'int', default: 0 })
  view_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;

  @Column({ type: 'varchar', length: 36, nullable: true })
  created_by: string;
}
