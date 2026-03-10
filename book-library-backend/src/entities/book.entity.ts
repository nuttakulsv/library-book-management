import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { optionalNumber, optionalString } from '../common/transformers/nullable.transformer';
import { Image } from './image.entity';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  author: string;

  @Column({ type: 'varchar', unique: true })
  isbn: string;

  @Column({ name: 'publication_year', type: 'int' })
  publicationYear: number;

  /** รูปปกจาก Master Images (ใช้ id อ้างอิง) */
  @Column({
    name: 'cover_image_id',
    type: 'int',
    nullable: true,
    transformer: optionalNumber,
  })
  coverImageId?: number;

  @ManyToOne(() => Image, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cover_image_id' })
  coverImageRelation?: Image;

  /** Legacy: path รูปปกเก่า (รองรับข้อมูลเดิมก่อน migrate) */
  @Column({
    name: 'cover_image',
    type: 'text',
    nullable: true,
    transformer: optionalString,
  })
  coverImage?: string;

  @Column({ name: 'total_quantity', type: 'int', default: 1 })
  totalQuantity: number;

  @Column({ name: 'available_quantity', type: 'int', default: 1 })
  availableQuantity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
