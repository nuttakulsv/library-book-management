import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Book } from '../entities/book.entity';
import { User } from '../entities/user.entity';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '1234';

const DUMMY_BOOKS = [
  { title: 'คู่มือการเขียนโปรแกรม Python', author: 'สมชาย ใจดี', isbn: '978-616-123-001-1', publicationYear: 2023, totalQuantity: 3 },
  { title: 'เรียนรู้ JavaScript ฉบับมือใหม่', author: 'สมหญิง รักเรียน', isbn: '978-616-123-002-2', publicationYear: 2024, totalQuantity: 2 },
  { title: 'การออกแบบฐานข้อมูล', author: 'วิชัย สร้างสรรค์', isbn: '978-616-123-003-3', publicationYear: 2022, totalQuantity: 4 },
  { title: 'พัฒนาเว็บด้วย React', author: 'ธนพล เทคโนโลยี', isbn: '978-616-123-004-4', publicationYear: 2024, totalQuantity: 2 },
  { title: 'โครงสร้างข้อมูลและอัลกอริทึม', author: 'ปัญญา คิดลึก', isbn: '978-616-123-005-5', publicationYear: 2021, totalQuantity: 5 },
  { title: 'ความปลอดภัยทางไซเบอร์', author: 'รักษ์ ข้อมูล', isbn: '978-616-123-006-6', publicationYear: 2023, totalQuantity: 2 },
  { title: 'การจัดการโปรเจกต์ซอฟต์แวร์', author: 'จัดการ ทีมงาน', isbn: '978-616-123-007-7', publicationYear: 2022, totalQuantity: 3 },
  { title: 'Machine Learning พื้นฐาน', author: 'ปัญญาประดิษฐ์ AI', isbn: '978-616-123-008-8', publicationYear: 2024, totalQuantity: 2 },
  { title: 'การทดสอบซอฟต์แวร์', author: 'ทดสอบ ตรวจสอบ', isbn: '978-616-123-009-9', publicationYear: 2023, totalQuantity: 4 },
  { title: 'DevOps และ CI/CD', author: 'พัฒนา รวดเร็ว', isbn: '978-616-123-010-0', publicationYear: 2024, totalQuantity: 2 },
];

@Injectable()
export class DatabaseSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
    await this.seedBooks();
  }

  private async seedAdmin(): Promise<void> {
    const existing = await this.userRepository.findOne({
      where: { username: ADMIN_USERNAME },
    });
    if (existing) {
      return;
    }
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const memberId = `M${Date.now().toString(36).toUpperCase().slice(-6)}ADMIN`;
    const admin = this.userRepository.create({
      memberId,
      username: ADMIN_USERNAME,
      password: hashedPassword,
      isAdministration: true,
    });
    await this.userRepository.save(admin);
    console.log(`[DatabaseSeeder] Admin user created: ${ADMIN_USERNAME}`);
  }

  private async seedBooks(): Promise<void> {
    const count = await this.bookRepository.count();
    if (count > 0) {
      return;
    }
    for (const b of DUMMY_BOOKS) {
      const book = this.bookRepository.create({
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        publicationYear: b.publicationYear,
        totalQuantity: b.totalQuantity,
        availableQuantity: b.totalQuantity,
      });
      await this.bookRepository.save(book);
    }
    console.log(`[DatabaseSeeder] Created ${DUMMY_BOOKS.length} dummy books`);
  }
}
