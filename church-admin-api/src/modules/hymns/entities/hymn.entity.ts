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

@Entity('hymns')
@Index(['church_id'])
@Index(['slug', 'church_id'], { unique: true })
@Index(['status', 'church_id'])
@Index(['is_featured', 'church_id'])
@Index(['published_at', 'church_id'])
export class HymnEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'varchar', length: 36 })
  church_id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 300, unique: true })
  slug: string;

  @Column({ type: 'text' })
  lyrics: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  author: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  composer: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  hymn_number: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  key: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tempo: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  audio_url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  midi_url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  featured_image_url: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;

  @Column({ type: 'datetime', nullable: true })
  published_at: Date;

  @Column({ type: 'datetime', nullable: true })
  scheduled_at: Date;

  @Column({ type: 'boolean', default: false })
  is_featured: boolean;

  @Column({ type: 'int', default: 0 })
  view_count: number;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;

  @Column({ type: 'varchar', length: 36, nullable: true })
  created_by: string;
}
