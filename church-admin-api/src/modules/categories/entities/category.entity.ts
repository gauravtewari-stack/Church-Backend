import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ContentStatus } from '../../../common/enums';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  church_id: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('varchar', { length: 255, unique: true })
  slug: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('varchar', { length: 7, nullable: true })
  color: string; // Hex color code

  @Column('varchar', { length: 100, nullable: true })
  icon: string; // Icon class or name

  @Column({ type: 'varchar', length: 36, nullable: true })
  parent_id: string; // For subcategories (self-referencing)

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @Column('integer', { default: 0 })
  order: number;

  @Column({ type: 'varchar', length: 50, default: ContentStatus.ACTIVE })
  status: ContentStatus;

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
}
