import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  username: string;
  email?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (_username: string, _password: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (username: string, _password: string) => {
        const user: User = {
          username,
          email: `${username}@example.com`,
        };
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage', // localStorage的key
    }
  )
);
