import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { ContentStatus } from '../../../common/enums';
import { Category } from '../../categories/entities/category.entity';
import { Media } from '../../media/entities/media.entity';

@Entity('sermons')
@Index(['church_id', 'status', 'deleted_at'])
@Index(['church_id', 'published_at'])
@Index(['church_id', 'created_at'])
@Index(['slug'])
export class Sermon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  church_id: string;

  @Column('varchar', { length: 500 })
  title: string;

  @Column('varchar', { length: 500, unique: true })
  slug: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('text', { nullable: true })
  content: string; // Rich content (HTML)

  @Column('varchar', { length: 255, nullable: true })
  speaker_name: string;

  @Column('varchar', { length: 255, nullable: true })
  speaker_title: string;

  @Column({ type: 'datetime', nullable: true })
  sermon_date: Date;

  @Column('integer', { nullable: true })
  duration_minutes: number;

  @Column('varchar', { length: 500, nullable: true })
  featured_image_url: string;

  @Column('varchar', { length: 500, nullable: true })
  video_url: string;

  @Column('varchar', { length: 500, nullable: true })
  audio_url: string;

  @Column({ type: 'varchar', length: 50, default: ContentStatus.DRAFT })
  status: ContentStatus;

  @Column({ type: 'datetime', nullable: true })
  published_at?: Date;

  @Column({ type: 'datetime', nullable: true })
  scheduled_at?: Date;

  @Column('boolean', { default: false })
  is_featured: boolean;

  @Column('varchar', { length: 255, nullable: true })
  seo_title: string;

  @Column('text', { nullable: true })
  seo_description: string;

  @Column('integer', { default: 0 })
  view_count: number;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at?: Date;

  @Column({ type: 'varchar', length: 36, nullable: true })
  created_by?: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  updated_by?: string;

  // Relations
  @ManyToMany(() => Category, {
    cascade: false,
    eager: false,
  })
  @JoinTable({
    name: 'sermon_categories',
    joinColumn: { name: 'sermon_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories?: Category[];

  @ManyToMany(() => Media, {
    cascade: false,
    eager: false,
  })
  @JoinTable({
    name: 'sermon_media',
    joinColumn: { name: 'sermon_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'media_id', referencedColumnName: 'id' },
  })
  media?: Media[];
}
