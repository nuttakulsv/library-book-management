import type * as ms from 'ms';

/** ค่า config สำหรับ JWT */
export interface JwtConfig {
  JWT_SECRET: string;
  JWT_EXPIRES_IN: ms.StringValue;
}
