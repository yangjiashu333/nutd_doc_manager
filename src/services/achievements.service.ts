import supabase from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type AchievementRow = Database['public']['Tables']['achievements']['Row'];
type AchievementInsert = Database['public']['Tables']['achievements']['Insert'];
type AchievementUpdate = Database['public']['Tables']['achievements']['Update'];

export interface CreateAchievementData {
  title: string;
  subject_id: number;
  type?: string | null;
  doc_path?: string | null;
  pdf_path?: string | null;
}

export interface UpdateAchievementData {
  title?: string;
  type?: string | null;
  doc_path?: string | null;
  pdf_path?: string | null;
}

export class AchievementsService {
  async getAchievements(): Promise<AchievementRow[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`获取成果列表失败: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('获取成果列表失败，请稍后重试');
    }
  }

  async getAchievementsBySubject(subjectId: number): Promise<AchievementRow[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('subject_id', subjectId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`获取课题成果失败: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('获取课题成果失败，请稍后重试');
    }
  }

  async getAchievement(id: number): Promise<AchievementRow> {
    try {
      const { data, error } = await supabase.from('achievements').select('*').eq('id', id).single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('成果不存在');
        }
        throw new Error(`获取成果详情失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('获取成果详情失败，请稍后重试');
    }
  }

  async createAchievement(achievementData: CreateAchievementData): Promise<AchievementRow> {
    try {
      const insertData: AchievementInsert = {
        title: achievementData.title,
        subject_id: achievementData.subject_id,
        type: achievementData.type || null,
        doc_path: achievementData.doc_path || null,
        pdf_path: achievementData.pdf_path || null,
      };

      const { data, error } = await supabase
        .from('achievements')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        if (error.code === '23503') {
          throw new Error('关联的课题不存在');
        }
        if (error.code === '23502') {
          throw new Error('成果信息不完整');
        }
        throw new Error(`创建成果失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('创建成果失败，请稍后重试');
    }
  }

  async updateAchievement(id: number, updates: UpdateAchievementData): Promise<AchievementRow> {
    try {
      const updateData: AchievementUpdate = {};

      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.doc_path !== undefined) updateData.doc_path = updates.doc_path;
      if (updates.pdf_path !== undefined) updateData.pdf_path = updates.pdf_path;

      const { data, error } = await supabase
        .from('achievements')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('成果不存在');
        }
        throw new Error(`更新成果失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('更新成果失败，请稍后重试');
    }
  }

  async deleteAchievement(id: number): Promise<void> {
    try {
      const { error } = await supabase.from('achievements').delete().eq('id', id);

      if (error) {
        throw new Error(`删除成果失败: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('删除成果失败，请稍后重试');
    }
  }
}

export const achievementsService = new AchievementsService();
