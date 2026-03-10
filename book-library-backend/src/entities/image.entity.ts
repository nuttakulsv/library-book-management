import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  optionalNumber,
  optionalString,
} from '../common/transformers/nullable.transformer';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'file_name', type: 'varchar' })
  fileName: string;

  @Column({ name: 'file_path', type: 'varchar' })
  filePath: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ name: 'file_size', type: 'int', default: 0 })
  fileSize: number;

  @Column({
    name: 'original_name',
    type: 'varchar',
    nullable: true,
    transformer: optionalString,
  })
  originalName?: string;

  @Column({
    name: 'width',
    type: 'int',
    nullable: true,
    transformer: optionalNumber,
  })
  width?: number;

  @Column({
    name: 'height',
    type: 'int',
    nullable: true,
    transformer: optionalNumber,
  })
  height?: number;

  @Column({
    name: 'alt_text',
    type: 'varchar',
    nullable: true,
    transformer: optionalString,
  })
  altText?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
