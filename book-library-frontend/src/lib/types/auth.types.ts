/** ผู้ใช้ทั่วไป (จาก API register/login) */
export interface User {
  id: number;
  memberId?: string;
  username: string;
  email?: string;
  isAdministration?: boolean;
  createdAt: string;
}

/** Session ผู้ใช้ที่ login แล้ว (isAdministration ต้องมี) */
export interface ISession extends Pick<User, 'id' | 'memberId' | 'username' | 'email' | 'createdAt'> {
  isAdministration: boolean;
}

/** รายการผู้ใช้ (admin) */
export interface UserListItem extends ISession {}

/** Response จาก login/register */
export interface AuthResponse {
  token: string;
  user: ISession;
}

/** Context value ของ AuthProvider */
export interface AuthContextType {
  user: ISession | undefined;
  token: string | undefined;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ user: ISession }>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}
