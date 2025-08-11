import supabase from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export interface CreateProfileData {
  user_id: string;
  name?: string;
  avatar_path?: string | null;
  role: 'admin' | 'user';
}

export interface UpdateProfileData {
  name?: string;
  avatar_path?: string | null;
  role?: 'admin' | 'user';
}

export class ProfilesService {
  async getProfile(userId: string): Promise<ProfileRow> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('用户资料不存在');
        }
        throw new Error(`获取用户资料失败: ${error.message}`);
      }
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('获取用户资料失败，请稍后重试');
    }
  }

  async createProfile(profileData: CreateProfileData): Promise<ProfileRow> {
    try {
      const insertData: ProfileInsert = {
        user_id: profileData.user_id,
        name: profileData.name,
        role: profileData.role || 'user',
        avatar_path: profileData.avatar_path || null,
      };

      const { data, error } = await supabase.from('profiles').insert(insertData).select().single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('该用户资料已存在');
        }
        throw new Error(`创建用户资料失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('创建用户资料失败，请稍后重试');
    }
  }

  async updateProfile(userId: string, updates: UpdateProfileData): Promise<ProfileRow> {
    try {
      const updateData: ProfileUpdate = {};

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.avatar_path !== undefined) updateData.avatar_path = updates.avatar_path;
      if (updates.role !== undefined) updateData.role = updates.role;

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('用户资料不存在');
        }
        throw new Error(`更新用户资料失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('更新用户资料失败，请稍后重试');
    }
  }

  async deleteProfile(userId: string): Promise<void> {
    try {
      const { error } = await supabase.from('profiles').delete().eq('user_id', userId);

      if (error) {
        throw new Error(`删除用户资料失败: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('删除用户资料失败，请稍后重试');
    }
  }

  async getAllProfiles(): Promise<ProfileRow[]> {
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('name');

      if (error) {
        throw new Error(`获取用户列表失败: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('获取用户列表失败，请稍后重试');
    }
  }
}

export const profilesService = new ProfilesService();
