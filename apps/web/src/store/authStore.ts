import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/index.js';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        localStorage.setItem('vitatrack_token', token);
        localStorage.setItem('vitatrack_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('vitatrack_token');
        localStorage.removeItem('vitatrack_user');
        set({ user: null, token: null, isAuthenticated: false });
      },
      initAuth: () => {
        const token = localStorage.getItem('vitatrack_token');
        const userStr = localStorage.getItem('vitatrack_user');
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr) as User;
            set({ user, token, isAuthenticated: true });
          } catch {
            localStorage.removeItem('vitatrack_token');
            localStorage.removeItem('vitatrack_user');
          }
        }
      },
    }),
    {
      name: 'vitatrack-auth',
    }
  )
);
