import { api, clearToken, setToken } from '@/lib/axios';
import type { ApiResponse, AuthResponse, ISession } from '@/lib/types';

function unwrap<T>(res: ApiResponse<T> | T): T {
  if (res && typeof res === 'object' && 'status' in res && 'data' in res) {
    return (res as ApiResponse<T>).data;
  }
  return res as T;
}

export const authService = {
  async login(username: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse> | AuthResponse>('/auth/login', {
      username,
      password,
    });
    const result = unwrap(data);
    setToken(result.token);
    return result;
  },

  async register(username: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse> | AuthResponse>('/auth/register', {
      username,
      password,
    });
    const result = unwrap(data);
    setToken(result.token);
    return result;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      clearToken();
    }
  },

  async getSession(): Promise<ISession> {
    const { data } = await api.get<ApiResponse<ISession> | ISession>('/auth/session');
    return unwrap(data);
  },
};
