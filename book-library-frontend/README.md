# Book Library Frontend

Next.js App สำหรับระบบห้องสมุด

## Tech Stack

- Next.js 16 (App Router) + TypeScript + Tailwind

## Setup

```bash
npm install
```

## Run

```bash
# Dev
npm run dev

# Prod
npm run build
npm start
```

เปิด http://localhost:3000

## Environment

สร้าง `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Backend ต้องรันอยู่ที่ URL นี้

## Monitoring

`GET /api/metrics` — Prometheus metrics (CPU, memory, event loop)

## ฟีเจอร์

- ล็อกอิน / สมัคร
- รายการหนังสือ + ค้นหา
- รายละเอียดหนังสือ
- เพิ่ม/แก้หนังสือ (Admin)
- ยืม/คืน
- อัปโหลดรูปปก

## โครงสร้าง

```
src/
├── app/            # หน้า login, register, books
├── components/
├── contexts/       # AuthContext
├── hooks/          # useBooks, useImages
├── lib/            # API client
└── services/
```
