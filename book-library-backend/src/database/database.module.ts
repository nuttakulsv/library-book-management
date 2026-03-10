import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../entities/book.entity';
import { User } from '../entities/user.entity';
import { DatabaseSeeder } from './database.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([User, Book])],
  providers: [DatabaseSeeder],
})
export class DatabaseModule {}
