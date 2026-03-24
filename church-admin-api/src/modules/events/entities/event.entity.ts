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

@Entity('events')
@Index(['church_id', 'status', 'deleted_at'])
@Index(['church_id', 'event_date'])
@Index(['slug'])
@Index(['church_id', 'is_featured'])
export class Event {
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

  @Column('text', { nullable: true })
  content: string; // Rich content (HTML)

  @Column({ type: 'datetime' })
  event_date: Date;

  @Column({ type: 'datetime', nullable: true })
  event_end_date: Date;

  @Column('varchar', { length: 500, nullable: true })
  location_name: string;

  @Column('varchar', { length: 1000, nullable: true })
  location_address: string;

  @Column({ type: 'real', nullable: true })
  location_lat: number;

  @Column({ type: 'real', nullable: true })
  location_lng: number;

  @Column('boolean', { default: false })
  is_virtual: boolean;

  @Column('varchar', { length: 500, nullable: true })
  virtual_link: string;

  @Column('varchar', { length: 500, nullable: true })
  featured_image_url: string;

  @Column('varchar', { length: 500, nullable: true })
  flyer_url: string;

  @Column({ type: 'varchar', length: 50, default: ContentStatus.DRAFT })
  status: ContentStatus;

  @Column({ type: 'datetime', nullable: true })
  published_at: Date;

  @Column({ type: 'datetime', nullable: true })
  scheduled_at: Date;

  @Column('boolean', { default: false })
  is_featured: boolean;

  @Column('boolean', { default: false })
  rsvp_enabled: boolean;

  @Column('integer', { default: 0 })
  rsvp_count: number;

  @Column('integer', { nullable: true })
  max_attendees: number;

  @Column('varchar', { length: 500, nullable: true })
  registration_url: string;

  @Column('varchar', { length: 500, nullable: true })
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
  deleted_at: Date;

  @Column({ type: 'varchar', length: 36, nullable: true })
  created_by: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  updated_by: string;

  // Relations
  @ManyToMany(() => Category, {
    cascade: false,
    eager: false,
  })
  @JoinTable({
    name: 'event_categories',
    joinColumn: { name: 'event_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: Category[];
}
