import supabase from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type SubjectRow = Database['public']['Tables']['subjects']['Row'];
type SubjectInsert = Database['public']['Tables']['subjects']['Insert'];
type SubjectUpdate = Database['public']['Tables']['subjects']['Update'];

export interface SubjectWithAchievements extends SubjectRow {
  achievements: { count: number }[];
  profiles?: {
    name: string | null;
  } | null;
}

export interface CreateSubjectData {
  title: string;
  owner_id?: string | null;
  status?: 'preparing' | 'launched' | 'finished' | null;
  kickoff_date?: string | null;
  deadline_date?: string | null;
}

export interface UpdateSubjectData {
  title?: string | null;
  owner_id?: string | null;
  status?: 'preparing' | 'launched' | 'finished' | null;
  kickoff_date?: string | null;
  deadline_date?: string | null;
}

export interface SubjectStats {
  total: number;
  preparing: number;
  launched: number;
  finished: number;
  dueSoon: number;
}

export class SubjectsService {
  async getSubjects(): Promise<SubjectWithAchievements[]> {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select(
          `
          *,
          achievements(count)
        `
        )
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`获取课题列表失败: ${error.message}`);
      }

      // 手动获取owner信息
      const enrichedData = await Promise.all(
        (data || []).map(async (subject) => {
          if (subject.owner_id) {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('name')
                .eq('user_id', subject.owner_id)
                .single();
              return {
                ...subject,
                profiles: profile,
              };
            } catch {
              return {
                ...subject,
                profiles: null,
              };
            }
          }
          return {
            ...subject,
            profiles: null,
          };
        })
      );

      return enrichedData;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('获取课题列表失败，请稍后重试');
    }
  }

  async getSubject(id: number): Promise<SubjectWithAchievements> {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select(
          `
          *,
          achievements(count)
        `
        )
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('课题不存在');
        }
        throw new Error(`获取课题详情失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('获取课题详情失败，请稍后重试');
    }
  }

  async getSubjectStats(): Promise<SubjectStats> {
    try {
      const { data, error } = await supabase.from('subjects').select('status, deadline_date');

      if (error) {
        throw new Error(`获取课题统计失败: ${error.message}`);
      }

      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const stats: SubjectStats = {
        total: data?.length || 0,
        preparing: 0,
        launched: 0,
        finished: 0,
        dueSoon: 0,
      };

      data?.forEach((subject) => {
        if (subject.status === 'preparing') stats.preparing++;
        else if (subject.status === 'launched') stats.launched++;
        else if (subject.status === 'finished') stats.finished++;

        if (
          subject.status === 'launched' &&
          subject.deadline_date &&
          new Date(subject.deadline_date) <= sevenDaysFromNow
        ) {
          stats.dueSoon++;
        }
      });

      return stats;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('获取课题统计失败，请稍后重试');
    }
  }

  async createSubject(subjectData: CreateSubjectData): Promise<SubjectRow> {
    try {
      const insertData: SubjectInsert = {
        title: subjectData.title,
        owner_id: subjectData.owner_id || null,
        status: subjectData.status || 'preparing',
        kickoff_date: subjectData.kickoff_date || null,
        deadline_date: subjectData.deadline_date || null,
      };

      const { data, error } = await supabase.from('subjects').insert(insertData).select().single();

      if (error) {
        if (error.code === '23502') {
          throw new Error('课题信息不完整');
        }
        throw new Error(`创建课题失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('创建课题失败，请稍后重试');
    }
  }

  async updateSubject(id: number, updates: UpdateSubjectData): Promise<SubjectRow> {
    try {
      const updateData: SubjectUpdate = {};

      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.kickoff_date !== undefined) updateData.kickoff_date = updates.kickoff_date;
      if (updates.deadline_date !== undefined) updateData.deadline_date = updates.deadline_date;
      if (updates.owner_id !== undefined) updateData.owner_id = updates.owner_id;

      const { data, error } = await supabase
        .from('subjects')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('课题不存在');
        }
        throw new Error(`更新课题失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('更新课题失败，请稍后重试');
    }
  }

  async deleteSubject(id: number): Promise<void> {
    try {
      const { error } = await supabase.from('subjects').delete().eq('id', id);

      if (error) {
        if (error.code === '23503') {
          throw new Error('无法删除课题，存在关联的成果数据');
        }
        throw new Error(`删除课题失败: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('删除课题失败，请稍后重试');
    }
  }

  async getSubjectsByOwner(ownerId: string): Promise<SubjectWithAchievements[]> {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select(
          `
          *,
          achievements(count)
        `
        )
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`获取用户课题失败: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('获取用户课题失败，请稍后重试');
    }
  }

  async getSubjectsByStatus(
    status: 'preparing' | 'launched' | 'finished'
  ): Promise<SubjectWithAchievements[]> {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select(
          `
          *,
          achievements(count)
        `
        )
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`获取课题列表失败: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('获取课题列表失败，请稍后重试');
    }
  }
}

export const subjectsService = new SubjectsService();
