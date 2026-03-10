/** ผู้ใช้ที่ผ่านการ authenticate แล้ว (จาก JWT) */
export interface AuthUser {
  id: number;
  memberId?: string;
  username: string;
  email?: string;
  isAdministration: boolean;
  createdAt: Date;
}
