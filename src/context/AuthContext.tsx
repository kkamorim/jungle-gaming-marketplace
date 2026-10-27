import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { User, UserSession, LoginCredentials, RegisterPayload } from '../types';
import api from '../api/client';

interface AuthContextType {
  user: User | null;
  session: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    api
      .get<any>('/session')
      .then((res) => {
        const userObj = res.data?.user ?? res.data;
        setSession({
          user: userObj,
          token: storedToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
      })
      .catch(() => {
        localStorage.removeItem('auth_token');
        setSession(null);
        queryClient.clear();
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Listen for auth expiration events dispatched by axios interceptor
    const handleAuthExpired = () => {
      localStorage.removeItem('auth_token');
      setSession(null);
      queryClient.clear();
      queryClient.clear();
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, [queryClient]);

  const login = async (credentials: LoginCredentials) => {
    const res = await api.post<UserSession>('/login', credentials);
    localStorage.setItem('auth_token', res.data.token);
    setSession(res.data);
    queryClient.clear();
    try {
      await api.post('/cart/merge');
    } catch {
      // Ignore if no items to merge
    }
  };

  const register = async (payload: RegisterPayload) => {
    const res = await api.post<UserSession>('/register', payload);
    localStorage.setItem('auth_token', res.data.token);
    setSession(res.data);
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem('auth_token');
      setSession(null);
      queryClient.clear();
    }
  };

  const refreshProfile = async () => {
    if (!session) return;
    try {
      const res = await api.get<any>('/profile');
      const updatedUser = res.data?.user ?? res.data;
      setSession((prev) => (prev ? { ...prev, user: updatedUser } : null));
    } catch (err) {
      console.error('Failed to refresh profile', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        isAuthenticated: !!session,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}




