import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { optionalString } from '../common/transformers/nullable.transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'member_id',
    type: 'varchar',
    unique: true,
    nullable: true,
    transformer: optionalString,
  })
  memberId?: string;

  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'text', nullable: true, transformer: optionalString })
  email?: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ name: 'is_administration', type: 'boolean', default: false })
  isAdministration: boolean;

  @Column({
    name: 'auth_token',
    type: 'text',
    nullable: true,
    transformer: optionalString,
  })
  authToken?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
