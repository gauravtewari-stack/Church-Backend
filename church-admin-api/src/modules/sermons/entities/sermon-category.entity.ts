import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Sermon } from './sermon.entity';

@Entity('sermon_categories')
export class SermonCategory {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  sermon_id: string;

  @PrimaryColumn({ type: 'varchar', length: 36 })
  category_id: string;

  @ManyToOne(() => Sermon, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sermon_id' })
  sermon: Sermon;

  @CreateDateColumn()
  created_at: Date;
}
