import supabase from '@/lib/supabase';
import type { AuthError, Session } from '@supabase/supabase-js';

export interface AuthSignUpData {
  email: string;
  password: string;
}

export interface AuthSignInData {
  email: string;
  password: string;
}

export class AuthService {
  async signUp(data: AuthSignUpData) {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw new Error(this.getAuthErrorMessage(error));
      }

      return authData;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('注册失败，请稍后重试');
    }
  }

  async signIn(data: AuthSignInData) {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw new Error(this.getAuthErrorMessage(error));
      }

      return authData;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('登录失败，请稍后重试');
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(this.getAuthErrorMessage(error));
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('退出登录失败，请稍后重试');
    }
  }

  async getSession(): Promise<Session | null> {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        throw new Error(this.getAuthErrorMessage(error));
      }

      return session;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('获取会话信息失败');
    }
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  private getAuthErrorMessage(error: AuthError): string {
    switch (error.message) {
      case 'Invalid login credentials':
        return '用户名或密码错误';
      case 'Email not confirmed':
        return '邮箱尚未验证，请检查邮件';
      case 'User already registered':
        return '该邮箱已被注册';
      case 'Password should be at least 6 characters':
        return '密码至少需要6位字符';
      case 'Invalid email':
        return '邮箱格式不正确';
      default:
        return error.message || '操作失败，请稍后重试';
    }
  }
}

export const authService = new AuthService();
