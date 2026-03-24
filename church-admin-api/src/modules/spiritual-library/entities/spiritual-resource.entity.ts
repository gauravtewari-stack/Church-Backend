import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('spiritual_resources')
@Index(['church_id'])
@Index(['slug', 'church_id'], { unique: true })
@Index(['status', 'church_id'])
@Index(['resource_type', 'church_id'])
@Index(['is_featured', 'church_id'])
@Index(['published_at', 'church_id'])
export class SpiritualResourceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'varchar', length: 36 })
  church_id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 300, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  author: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  featured_image_url: string;

  @Column({ type: 'varchar', length: 50, default: 'article' })
  resource_type: 'article' | 'devotional' | 'book' | 'pdf';

  @Column({ type: 'varchar', length: 500, nullable: true })
  file_url: string;

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status: 'draft' | 'published' | 'scheduled' | 'archived';

  @Column({ type: 'datetime', nullable: true })
  published_at: Date;

  @Column({ type: 'datetime', nullable: true })
  scheduled_at: Date;

  @Column({ type: 'boolean', default: false })
  is_featured: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  seo_title: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  seo_description: string;

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
