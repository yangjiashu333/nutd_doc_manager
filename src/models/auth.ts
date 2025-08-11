import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, profilesService } from '@/services';
import type { Database } from '@/types/database.types';

type RoleType = Database['public']['Enums']['role_type'];

interface User {
  id: string;
  email: string;
  name: string | null;
  role: RoleType;
  avatar_path: string | null;
  created_at: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;

  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  updateProfile: (updates: { name?: string; avatar_path?: string }) => Promise<void>;
  isAdmin: () => boolean;
  hasRole: (role: RoleType) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitializing: false,

      signUp: async (email: string, password: string, name: string) => {
        set({ isLoading: true });
        try {
          if (!name) {
            throw new Error('姓名不能为空');
          }
          const authData = await authService.signUp({ email, password });
          if (authData.user) {
            await profilesService.createProfile({
              user_id: authData.user.id,
              name,
              role: 'user',
            });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      signIn: async (email: string, password: string) => {
        set({ isLoading: true });

        try {
          const authData = await authService.signIn({ email, password });
          if (authData.user) {
            const profile = await profilesService.getProfile(authData.user.id);
            const user: User = {
              id: authData.user.id,
              email: authData.user.email!,
              name: profile.name,
              role: profile.role || 'user',
              avatar_path: profile.avatar_path,
              created_at: profile.created_at,
            };

            set({ user, isAuthenticated: true, isLoading: false });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        set({ isLoading: true });

        try {
          await authService.signOut();
        } finally {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      initialize: async () => {
        set({ isInitializing: true });
        try {
          const session = await authService.getSession();
          if (!session?.user) {
            set({ user: null, isAuthenticated: false, isInitializing: false });
            return;
          }
          const profile = await profilesService.getProfile(session.user.id);
          const user: User = {
            id: session.user.id,
            email: session.user.email!,
            name: profile.name,
            role: profile.role || 'user',
            avatar_path: profile.avatar_path,
            created_at: profile.created_at,
          };
          set({ user, isAuthenticated: true, isInitializing: false });

          authService.onAuthStateChange(async (_event, session) => {
            if (!session?.user) {
              set({ user: null, isAuthenticated: false, isInitializing: false });
              return;
            }
            const profile = await profilesService.getProfile(session.user.id);
            const user: User = {
              id: session.user.id,
              email: session.user.email!,
              name: profile.name,
              role: profile.role || 'user',
              avatar_path: profile.avatar_path,
              created_at: profile.created_at,
            };
            set({ user, isAuthenticated: true, isInitializing: false });
          });
        } catch {
          set({ user: null, isAuthenticated: false, isInitializing: false });
        }
      },

      updateProfile: async (updates: { name?: string; avatar_path?: string }) => {
        const { user } = get();
        if (!user) throw new Error('用户未登录');

        const updatedProfile = await profilesService.updateProfile(user.id, updates);

        const updatedUser: User = {
          ...user,
          name: updatedProfile.name,
          avatar_path: updatedProfile.avatar_path,
        };

        set({ user: updatedUser });
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },

      hasRole: (role: RoleType) => {
        const { user } = get();
        return user?.role === role;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
