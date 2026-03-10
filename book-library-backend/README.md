# Book Library Backend

NestJS API สำหรับระบบห้องสมุด

## Tech Stack

- NestJS + TypeScript
- PostgreSQL (Docker) / SQLite (local)
- class-validator, class-transformer

## Setup

```bash
npm install
```

## Run

```bash
# Dev (ไม่มี DB_HOST จะใช้ SQLite)
npm run start:dev

# Prod
npm run build
npm run start:prod

# ใช้ port 3001 ให้ตรงกับ frontend
PORT=3001 npm run start:dev
```

## Tests

```bash
npm test
```

มี tests ให้ Services, Controllers, pagination ประมาณ 107 tests

## API

### Auth

| Method | Endpoint | ใช้ทำ |
|--------|----------|-------|
| POST | `/auth/register` | สมัคร |
| POST | `/auth/login` | ล็อกอิน |
| GET | `/auth/session` | ดู session (Bearer token) |
| POST | `/auth/logout` | ล็อกเอาท์ |

### Books

| Method | Endpoint | ใช้ทำ |
|--------|----------|-------|
| GET | `/books` | รายการ (+ search, pagination) |
| GET | `/books/:id` | รายละเอียด |
| POST | `/books` | เพิ่ม (Admin) |
| PUT | `/books/:id` | แก้ (Admin) |
| DELETE | `/books/:id` | ลบ (Admin) |
| POST | `/books/:id/borrow` | ยืม |
| POST | `/books/:id/return` | คืน |

### Monitoring

| Method | Endpoint | ใช้ทำ |
|--------|----------|-------|
| GET | `/metrics` | Prometheus metrics (CPU, memory, etc.) |

### Admin

- Username: `admin`
- Password: `1234`

สร้างให้อัตโนมัติตอนรันครั้งแรก

## Environment

ดู `.env.example` — ตั้ง `DB_HOST` ถ้าใช้ PostgreSQL ไม่ตั้งจะใช้ SQLite

## โครงสร้าง

```
src/
├── auth/           # Auth, guards
├── books/          # CRUD, ยืม/คืน
├── images/         # อัปโหลดรูป
├── users/          # จัดการ user (Admin)
├── entities/
├── common/         # DTOs, types, pagination
└── database/       # Seeder
```
