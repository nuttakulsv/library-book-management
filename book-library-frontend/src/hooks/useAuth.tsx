'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AuthContextType, ISession } from '@/lib/types';
import { getToken } from '@/lib/axios';
import { authService } from '@/services/auth.service';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(!!getToken());
  }, []);

  const sessionQuery = useQuery({
    queryKey: ['session'],
    queryFn: () => authService.getSession(),
    enabled: hasToken,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      authService.login(username, password),
    onSuccess: (data) => {
      setHasToken(true);
      queryClient.setQueryData(['session'], data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      authService.register(username, password),
    onSuccess: (data) => {
      setHasToken(true);
      queryClient.setQueryData(['session'], data.user);
    },
  });

  useEffect(() => {
    if (sessionQuery.isError) {
      setHasToken(false);
    }
  }, [sessionQuery.isError]);

  const user = sessionQuery.data;
  const token = getToken();
  const isLoading =
    (hasToken && sessionQuery.isLoading) ||
    loginMutation.isPending ||
    registerMutation.isPending;

  const login = useCallback(
    async (username: string, password: string) => {
      const result = await loginMutation.mutateAsync({ username, password });
      return { user: result.user };
    },
    [loginMutation]
  );

  const register = useCallback(
    async (username: string, password: string) => {
      await registerMutation.mutateAsync({ username, password });
    },
    [registerMutation]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setHasToken(false);
      queryClient.clear();
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
