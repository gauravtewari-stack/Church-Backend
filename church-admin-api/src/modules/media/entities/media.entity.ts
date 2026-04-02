import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  DataSource,
} from 'typeorm';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
}

export enum MediaStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

@Entity('media')
@Index(['church_id', 'file_type'])
@Index(['church_id', 'status'])
@Index(['church_id', 'created_at'])
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  church_id: string;

  @Column('varchar', { length: 255 })
  title: string;

  @Column('varchar', { length: 500 })
  file_name: string;

  @Column('varchar', { length: 1000, nullable: true })
  file_path: string;

  @Column('varchar', { length: 1000 })
  url: string;

  @Column('varchar', { length: 100 })
  mime_type: string;

  @Column({ type: 'integer' })
  file_size: number;

  @Column({ type: 'varchar', length: 50 })
  file_type: string;

  @Column('int', { nullable: true })
  width: number | null;

  @Column('int', { nullable: true })
  height: number | null;

  @Column('int', { nullable: true })
  duration_seconds: number | null;

  @Column('varchar', { length: 1000, nullable: true })
  thumbnail_url: string | null;

  @Column('text', { nullable: true })
  description: string | null;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column('varchar', { length: 500, nullable: true })
  alt_text: string | null;

  @Column('int', { default: 0 })
  usage_count: number;

  @Column('varchar', { length: 255, nullable: true })
  folder: string | null;

  @Column({ type: 'varchar', length: 50, default: MediaStatus.ACTIVE })
  status: MediaStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date | null;

  @Column({ type: 'varchar', length: 36 })
  uploaded_by: string;
}
