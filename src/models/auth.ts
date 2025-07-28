import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import supabase from '../lib/supabase';
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

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          set({ isLoading: false });
          throw error;
        }

        if (data.user) {
          if (!name) {
            throw new Error('Name is required');
          }
          const { error: profileError } = await supabase.from('profiles').insert({
            user_id: data.user.id,
            name,
            role: 'user',
            avatar_path: null,
          });

          if (profileError) {
            set({ isLoading: false });
            throw profileError;
          }
        }

        set({ isLoading: false });
      },

      signIn: async (email: string, password: string) => {
        set({ isLoading: true });

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          set({ isLoading: false });
          throw error;
        }

        if (data.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();

          if (profileError) {
            set({ isLoading: false });
            throw profileError;
          }

          const user: User = {
            id: data.user.id,
            email: data.user.email!,
            name: profile.name,
            role: profile.role || 'user',
            avatar_path: profile.avatar_path,
            created_at: profile.created_at,
          };

          set({ user, isAuthenticated: true, isLoading: false });
        }
      },

      signOut: async () => {
        set({ isLoading: true });

        const { error } = await supabase.auth.signOut();

        if (error) {
          set({ isLoading: false });
          throw error;
        }

        set({ user: null, isAuthenticated: false, isLoading: false });
      },

      initialize: async () => {
        set({ isInitializing: true });

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (profileError) {
            set({ user: null, isAuthenticated: false, isInitializing: false });
            return;
          }

          const user: User = {
            id: session.user.id,
            email: session.user.email!,
            name: profile.name,
            role: profile.role || 'user',
            avatar_path: profile.avatar_path,
            created_at: profile.created_at,
          };

          set({ user, isAuthenticated: true, isInitializing: false });
        } else {
          set({ user: null, isAuthenticated: false, isInitializing: false });
        }

        supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();

            if (!profileError && profile) {
              const user: User = {
                id: session.user.id,
                email: session.user.email!,
                name: profile.name,
                role: profile.role || 'user',
                avatar_path: profile.avatar_path,
                created_at: profile.created_at,
              };

              set({ user, isAuthenticated: true, isInitializing: false });
            }
          } else {
            set({ user: null, isAuthenticated: false, isInitializing: false });
          }
        });
      },

      updateProfile: async (updates: { name?: string; avatar_path?: string }) => {
        const { user } = get();
        if (!user) throw new Error('用户未登录');

        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('user_id', user.id)
          .select('*')
          .single();

        if (error) throw error;

        const updatedUser: User = {
          ...user,
          name: data.name,
          avatar_path: data.avatar_path,
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
