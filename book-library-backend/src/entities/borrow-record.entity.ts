import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { optionalDate } from '../common/transformers/nullable.transformer';
import { Book } from './book.entity';
import { User } from './user.entity';

@Entity('borrow_records')
export class BorrowRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'book_id', type: 'int' })
  bookId: number;

  @Column({ name: 'borrowed_at', type: 'timestamp' })
  borrowedAt: Date;

  @Column({
    name: 'returned_at',
    type: 'timestamp',
    nullable: true,
    transformer: optionalDate,
  })
  returnedAt?: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Book)
  @JoinColumn({ name: 'book_id' })
  book: Book;
}
