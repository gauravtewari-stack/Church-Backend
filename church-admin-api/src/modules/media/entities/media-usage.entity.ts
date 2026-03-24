import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Media } from './media.entity';

@Entity('media_usage')
@Index(['media_id', 'entity_type', 'entity_id'])
@Index(['church_id', 'media_id'])
export class MediaUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  media_id: string;

  @ManyToOne(() => Media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'media_id' })
  media: Media;

  @Column('varchar', { length: 100 })
  entity_type: string;

  @Column({ type: 'varchar', length: 36 })
  entity_id: string;

  @Column('varchar', { length: 100 })
  field_name: string;

  @Column({ type: 'varchar', length: 36 })
  church_id: string;

  @CreateDateColumn()
  created_at: Date;
}
