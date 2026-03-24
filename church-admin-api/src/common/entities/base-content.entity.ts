import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ContentStatus } from '../enums';

@Entity()
@Index(['church_id', 'slug'], { unique: true })
@Index(['church_id', 'status'])
@Index(['church_id', 'is_featured'])
@Index(['church_id', 'published_at'])
export abstract class BaseContentEntity extends BaseEntity {
  @Column('varchar', { length: 255, nullable: false })
  title: string;

  @Column('varchar', { length: 255, nullable: false, unique: true })
  slug: string;

  @Column('text', { nullable: true, default: null })
  description?: string | null;

  @Column({ type: 'varchar', length: 50, default: ContentStatus.DRAFT })
  status: ContentStatus;

  @Column('varchar', { length: 500, nullable: true, default: null })
  featured_image?: string | null;

  @Column('varchar', { length: 255, nullable: true, default: null })
  seo_title?: string | null;

  @Column('text', { nullable: true, default: null })
  seo_description?: string | null;

  @Column({ type: 'datetime', nullable: true, default: null })
  published_at?: Date | null;

  @Column({ type: 'datetime', nullable: true, default: null })
  scheduled_at?: Date | null;

  @Column('boolean', { default: false })
  is_featured: boolean;

  @Column('int', { default: 0 })
  view_count: number;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any> | null;

  constructor(partial?: Partial<BaseContentEntity>) {
    super(partial);
  }
}
