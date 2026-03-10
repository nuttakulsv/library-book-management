# Docker Setup

## วิธีรัน

### แบบมี tests ก่อน

```bash
./docker-compose-up.sh
```

ทำอะไรบ้าง:
1. รัน tests ใน backend ก่อน
2. ถ้าผ่าน → build + up
3. ถ้าไม่ผ่าน → แจ้ง error แล้วหยุด ไม่รัน Docker

ใช้ตอน deploy หรือก่อน push จะได้แน่ใจว่า tests ผ่าน

### แบบรันเลย

```bash
docker compose up --build -d
```

ข้าม tests รัน build และ start ทันที ใช้ตอน dev หรือตอนแน่ใจแล้วว่า code ใช้ได้

### รัน tests อย่างเดียว

```bash
cd book-library-backend
npm test
```

## Services

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend | http://localhost:3001 | 3001 |
| PostgreSQL | localhost:5432 | 5432 |
| Prometheus | http://localhost:9090 | 9090 |
| Grafana | http://localhost:3030 | 3030 |

## Monitoring

Prometheus scrape metrics จาก backend และ frontend ทุก 15 วินาที

- **Backend metrics**: `GET /metrics` (CPU, memory, event loop, etc.)
- **Frontend metrics**: `GET /api/metrics` (default Node.js metrics)

**Grafana**: login ด้วย admin / admin แล้วเพิ่ม Prometheus data source ที่ `http://prometheus:9090`

## Volumes

| โฟลเดอร์ | เก็บอะไร |
|----------|----------|
| `./postgres_data` | ข้อมูล PostgreSQL |
| `./backend_uploads` | รูปปกที่อัปโหลด |

## Environment

คัดลอก `.env.example` เป็น `.env` ถ้าต้องการ override ค่า

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Backend ใช้ `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` สำหรับ PostgreSQL  
Frontend ใช้ `NEXT_PUBLIC_API_URL` ชี้ไปที่ backend (ต้องเข้าถึงได้จาก browser)

## คำสั่งอื่นๆ

```bash
# Build + start
docker compose up --build -d

# รันแบบเห็น logs
docker compose up --build

# รันแค่ PostgreSQL
docker compose up postgres -d

# หยุด
docker compose down

# ดู logs
docker compose logs -f backend
docker compose logs -f frontend
```

## Deploy ไปที่อื่น

แก้ `NEXT_PUBLIC_API_URL` ใน `docker-compose.yml` ให้ชี้ไปที่ server จริง

```yaml
# ตัวอย่าง
NEXT_PUBLIC_API_URL: http://192.168.1.100:3001
```

## PostgreSQL

- User: `postgres`
- Password: `postgres`
- Database: `library`
- ข้อมูลอยู่ที่ `./postgres_data`
