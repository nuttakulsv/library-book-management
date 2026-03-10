import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { BooksModule } from './books/books.module';
import { UsersModule } from './users/users.module';
import { Book } from './entities/book.entity';
import { BorrowRecord } from './entities/borrow-record.entity';
import { Image } from './entities/image.entity';
import { User } from './entities/user.entity';
import { UploadModule } from './upload/upload.module';
import { ImagesModule } from './images/images.module';

const dataDir = join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: { enabled: true },
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        // Default เมื่อไม่มี .env: PORT=3000, DB_*=postgres/library, DB_HOST ว่าง=SQLite
        const dbHost = process.env.DB_HOST ?? '';
        const dbPort = process.env.DB_PORT ?? '5432';
        const dbUser = process.env.DB_USER ?? 'postgres';
        const dbPassword = process.env.DB_PASSWORD ?? 'postgres';
        const dbName = process.env.DB_NAME ?? 'library';

        if (dbHost.trim()) {
          return {
            type: 'postgres',
            host: dbHost,
            port: parseInt(dbPort, 10),
            username: dbUser,
            password: dbPassword,
            database: dbName,
            entities: [Book, User, BorrowRecord, Image],
            synchronize: true,
          };
        }

        return {
          type: 'sqlite',
          database: join(__dirname, '..', 'data', 'library.db'),
          entities: [Book, User, BorrowRecord, Image],
          synchronize: true,
        };
      },
    }),
    AuthModule,
    BooksModule,
    UsersModule,
    DatabaseModule,
    UploadModule,
    ImagesModule,
  ],
})
export class AppModule {}
