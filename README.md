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
library-book-managment/
├── book-library-backend/    # NestJS API
├── book-library-frontend/   # Next.js
├── docker-compose.yml
├── docker-compose-up.sh    # รัน tests ก่อนแล้วค่อย up
├── DOCKER.md
├── .env.example
├── backend_uploads/        # รูปที่อัปโหลด
└── postgres_data/          # ข้อมูล PostgreSQL (สร้างอัตโนมัติ)
```

## Code Architecture and Design Patterns

### Backend (NestJS)

แบ่งเป็น modules ตาม domain ครับ — Auth, Books, Users, Images — แต่ละ module มี Controller + Service + DTOs แยกกันชัดเจน ใช้ NestJS DI inject Repository กับ ConfigService เข้าไปใน Service/Guard

ข้อมูลใช้ TypeORM Repository กับ entities หลัก ๆ คือ Book, User, BorrowRecord, Image ส่วน input validation ใช้ class-validator (IsString, IsNotEmpty ฯลฯ) กับ ValidationPipe แบบ global ตั้ง whitelist, transform ไว้แล้ว

เรื่อง auth ใช้ Passport JWT strategy — route ที่ต้อง login ใส่ JwtAuthGuard ส่วน admin-only ใส่ AdminGuard เช็ค `isAdministration` อีกชั้น response ทั้งหมดห่อด้วย ResponseInterceptor ให้ออกมาเป็น `{ status: 'success', data }` แบบเดียวกันทุก endpoint

### Frontend (Next.js)

ใช้ App Router ครับ routes ตามโฟลเดอร์ layout แยกเป็น public / admin / protected ตาม role

ฝั่งเรียก API มี service layer (`auth.service`, `books.service` ฯลฯ) ใช้ axios instance เดียวกัน ที่มี interceptors ใส่ token ให้อัตโนมัติและแปลง error เป็นข้อความที่ user อ่านได้

ส่วน data fetching ใช้ TanStack Query ผ่าน custom hooks เช่น `useBooks`, `useAuth`, `useUsers` — รวม logic เรียก service + cache invalidation ไว้ใน hook เดียว layout หลักห่อด้วย AuthProvider, ToastProvider, QueryProvider และมี Query Keys Factory (`booksKeys.list()`, `booksKeys.detail(id)`) เพื่อให้ invalidation สอดคล้องกัน

### API Contract

response ทุก endpoint ใช้รูปแบบ `{ status: 'success', data: T }` ส่ง token ใน header `Authorization: Bearer <token>` ส่วน error จาก backend ส่ง `message` มา (string หรือ array) ฝั่ง frontend จะแปลงเป็นข้อความที่ user อ่านได้

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

## ถ้ามีเวลามากขึ้นจะปรับปรุงอะไร

-สิ่งที่ขาดไม่ได้เลย คือ Concept ของระบบจริงๆของห้องสมุด เช่น Dewey Decimal Classification (DDC) , Library of Congress Classification (LCC) และ อื่นๆเป็นต้น (ห้องในสมุดในไทยส่วนใหญ่ใช้ Dewey) ซึ่งถ้ามีเวลามากพอ จะต้องคุยกับ Expert Domainทางด้านี้ เพื่อ Drive Projectนี้ไปในทิศทางของการทำ DDD (Domain Driven Design) เพื่อให้ Projectออกมาในรูปแบบที่ดีและเหมาะสมกับผู้ใช้งาน  

-การเก็บรูปปกหนังสือ
ตอนนี้เก็บไว้ที่ local (./uploads) ซึ่งเหมาะกับการ demo หรือ run เครื่องเดียว แต่ถ้าระบบต้อง scale หลาย instance รูปจะไม่ถูกแชร์กัน ควรย้ายไปเก็บบน object storage เช่น S3 หรือ MinIO แทน (ถ้าอยากติดตั้งง่าย MinIO เวอร์ชันประมาณปี 2023 จะตั้ง public bucket ได้ค่อนข้างสะดวก)

-เพิ่มระบบวันครบกำหนดคืนหนังสือ (Due Date)
ตอนนี้การยืมหนังสือยังไม่มี due date และยังไม่มี logic สำหรับแจ้งเตือนหรือคิดค่าปรับกรณีคืนช้า ซึ่งเป็น feature ที่ระบบ library จริงควรมี

-เพิ่ม Refresh Token ในระบบ Auth
ตอนนี้ใช้แค่ access token อย่างเดียว พอ token หมดอายุก็ต้อง login ใหม่ ถ้ามี refresh token จะช่วยให้ UX ดีขึ้น และไม่ต้องให้ user login บ่อย

-เพิ่ม Rate Limiting
ตอนนี้ API ยังไม่มีการจำกัด request เช่น login หรือ endpoint สำคัญ ๆ อาจเสี่ยงโดน brute force หรือ spam request ได้ ควรเพิ่ม throttle หรือ rate limit

-เพิ่ม API Caching
endpoint ที่ใช้ query บ่อย เช่น list books หรือ search books ยังไม่มี caching ถ้าใช้งานจริงอาจเพิ่ม Redis cache เพื่อลดโหลด database

-E-mail Verification และ Password Reset
ตอนนี้ยังไม่มีระบบยืนยันอีเมลหรือรีเซ็ตรหัสผ่าน ซึ่งเป็น feature มาตรฐานของระบบที่มี authentication

-Soft Delete สำหรับหนังสือ
ตอนนี้การลบหนังสือเป็นการลบออกจาก database เลย (hard delete) ถ้าเป็นระบบจริงควรใช้ soft delete เพื่อให้ยังสามารถตรวจสอบย้อนหลังได้

-Structured Logging
ตอนนี้ logging ยังเป็นแบบพื้นฐาน ถ้าใช้งานจริงควรเพิ่ม structured logging (เช่น log เป็น JSON) เพื่อให้ monitor และ debug ใน production ได้ง่ายขึ้น

-ทำ CI/CD ทั้ง backed, frontend

-Monitoring & notification

## Trade-offs ในการทำเวอร์ชันนี้

เนื่องจากโจทย์จำกัดเวลาประมาณ 3–4 ชั่วโมง เลยเลือกวิธีที่ทำให้ระบบสามารถรันและ demo ได้เร็วที่สุดก่อน โดยมี trade-offs บางอย่างดังนี้

-Database
เลือกใช้ PostgreSQL ผ่าน Docker เพื่อให้สามารถเริ่มระบบได้ง่ายโดยไม่ต้องติดตั้ง database เพิ่ม ข้อดีคือ setup เร็ว จะไม่เหมาะกับระบบที่มี concurrent writes จำนวนมาก และ มีปัญหาเรื่องความปลอดภัย ในอนาคตควรใช้ database ที่มีวง VPN ครอบหรือ จำกัดการเข้าถึง 


-การเก็บรูปปกหนังสือ
ตอนนี้เก็บไฟล์ไว้ที่ local filesystem เพื่อให้ setup ง่ายและไม่ต้องพึ่งพา storage ภายนอก ข้อดีคือเริ่มต้นได้เร็ว แต่ข้อจำกัดคือไม่เหมาะกับการ scale หลาย instance และต้องจัดการเรื่อง backup เอง 

-Authentication
เลือกใช้ access token อย่างเดียวเพื่อให้ implementation ไม่ซับซ้อน ข้อดีคือระบบ auth ทำได้เร็วและตรงตาม requirement แต่ข้อจำกัดคือเมื่อ token หมดอายุ ผู้ใช้ต้อง login ใหม่ เพราะยังไม่มี refresh token

-Admin Account
มีการสร้าง default admin account สำหรับใช้ demo ระบบได้ทันที ทำให้ทดสอบ feature ต่าง ๆ ได้ง่าย แต่ในระบบจริงควรมีขั้นตอนให้เปลี่ยนรหัสผ่านหรือกำหนดผ่าน environment variable แทน สามารถเข้าถึงได้โดย id: admin , pw: 1234

-Docker Setup
ใช้ docker compose เพื่อรัน backend, database และ service อื่น ๆ ในคำสั่งเดียว ทำให้ environment สามารถ setup ได้ง่ายและเหมือนกันทุกเครื่อง แต่ผู้ที่ต้องการรันระบบจะต้องมี Docker ติดตั้งไว้ก่อน

-เน้นเก็บตัวระบบให้เป็นไปตาม requiredment ที่ต้องการโดยทั้งหมด โดยส่วนใหญ่เป็นการ vibe code โดยใช้ AI ช่วยและตรวจสอบ โดยใช้ test spec เข้าช่วยอีกที ภายในอนาคต คาดว่าน่าจะใช้ code reviewer ของทาง cluade ซึ่ง ณ วันนี้วันที่ 10 Mar พึ่งมีการปล่อยออกมาให้ลองเล่นกัน