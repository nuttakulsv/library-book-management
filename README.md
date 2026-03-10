# Book Library Management

ระบบจัดการห้องสมุด — ลงทะเบียน/ล็อกอิน, จัดการหนังสือ (เพิ่ม/แก้/ลบ), ค้นหา, ยืม/คืน พร้อมรูปปก

## Tech Stack

| ส่วน | ใช้ |
|------|-----|
| Frontend | React (Next.js 16) + TypeScript + Tailwind |
| Backend | Node.js (NestJS) + TypeScript |
| Database | PostgreSQL (Docker) / SQLite (รัน local) |

## วิธีรัน

### Docker

**แบบมี tests ก่อน (ปลอดภัยกว่า)**

```bash
./docker-compose-up.sh
```

จะรัน tests ก่อน ถ้าผ่านค่อย build + up ถ้าไม่ผ่านก็ไม่รัน Docker

**แบบรันเลย**

```bash
docker compose up --build -d
```

ข้าม tests รัน build และ start ทันที

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### รัน local (ไม่ใช้ Docker)

**Backend**

```bash
cd book-library-backend
npm install
PORT=3001 npm run start:dev
```

รันที่ port 3001 (ไม่มี PostgreSQL จะใช้ SQLite ให้)

**Frontend**

```bash
cd book-library-frontend
npm install
# สร้าง .env.local: NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev
```

เปิด http://localhost:3000

## URL และบัญชี

### เส้นทาง (Routes)

| URL | ใช้ทำ |
|-----|-------|
| `/` | หน้าหลัก ค้นหาและยืมหนังสือ |
| `/login` | เข้าสู่ระบบสมาชิก |
| `/login/admin` | เข้าสู่ระบบแอดมิน  -> `admin` | `1234` |
| `/register` | สมัครสมาชิก |
| `/books` | รายการหนังสือ |
| `/books/:id` | รายละเอียดหนังสือ |
| `/books/borrowed` | รายการที่ยืม (สมาชิก) |
| `/admin/books` | จัดการหนังสือ (แอดมิน) |
| `/admin/users` | จัดการสมาชิก (แอดมิน) |
| `/admin/images` | คลังรูปภาพ (แอดมิน) |
| `/admin/borrowed` | รายการที่ถูกยืม & รับคืน (แอดมิน) |
| `/books/new` | เพิ่มหนังสือ (แอดมิน) |

### บัญชี Admin (สร้างอัตโนมัติตอนรันครั้งแรก)

| Username | Password |
|----------|----------|
| `admin` | `1234` |

## ฟีเจอร์

- ลงทะเบียน / ล็อกอิน (JWT, bcrypt)
- จัดการหนังสือ — เพิ่ม แก้ ลบ ดูรายการ/รายละเอียด
- ค้นหาจาก title, author, ISBN
- อัปโหลดรูปปก (เก็บ local)
- ยืม/คืนหนังสือ
- Admin — จัดการ user, ดูรายการยืมทั้งหมด

## โครงสร้างโปรเจกต์

```
skilllane/
├── book-library-backend/    # NestJS API
├── book-library-frontend/   # Next.js
├── docker-compose.yml
├── docker-compose-up.sh    # รัน tests ก่อนแล้วค่อย up
├── DOCKER.md
├── .env.example
├── backend_uploads/        # รูปที่อัปโหลด
└── postgres_data/          # ข้อมูล PostgreSQL (สร้างอัตโนมัติ)
```

## Environment

คัดลอก `.env.example` เป็น `.env` แล้วแก้ตามต้องการ

รายละเอียดดูใน `book-library-backend/.env.example` และ `book-library-frontend/.env.example`

## Tests

```bash
cd book-library-backend
npm test
```

มี unit tests ให้ Services, Controllers ประมาณ 107 tests

`./docker-compose-up.sh` จะรัน tests ก่อน build/up อยู่แล้ว — ถ้าไม่ผ่านจะไม่รัน Docker

## API

| Method | Endpoint | ใช้ทำ |
|--------|----------|-------|
| POST | `/auth/register` | สมัคร |
| POST | `/auth/login` | ล็อกอิน |
| GET | `/auth/session` | ดู session (ต้องมี token) |
| GET | `/books` | รายการ (+ search, pagination) |
| GET | `/books/:id` | รายละเอียด |
| POST | `/books` | เพิ่ม (Admin) |
| PUT | `/books/:id` | แก้ (Admin) |
| DELETE | `/books/:id` | ลบ (Admin) |
| POST | `/books/:id/borrow` | ยืม |
| POST | `/books/:id/return` | คืน |

ส่ง token ใน Header: `Authorization: Bearer <token>`

