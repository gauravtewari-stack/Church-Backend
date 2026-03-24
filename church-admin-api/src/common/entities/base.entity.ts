import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
@Index(['church_id'])
@Index(['created_by'])
@Index(['updated_by'])
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  church_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({
    nullable: true,
    select: false, // Exclude soft-deleted records by default
  })
  @Exclude()
  deleted_at?: Date | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  created_by?: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  updated_by?: string | null;

  constructor(partial?: Partial<BaseEntity>) {
    Object.assign(this, partial);
  }
}
