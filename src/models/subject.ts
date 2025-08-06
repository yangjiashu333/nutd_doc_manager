import { create } from 'zustand';
import supabase from '@/lib/supabase';
import type { Tables } from '@/types/database.types';

export type Subject = Tables<'subjects'>;
export type SubjectStatus = Tables<'subjects'>['status'];

export interface SubjectWithAchievements extends Subject {
  achievements: { count: number }[];
}

export interface SubjectStats {
  total: number;
  preparing: number;
  launched: number;
  finished: number;
  dueSoon: number;
}

export interface SubjectFilters {
  search: string;
  status: SubjectStatus | 'all';
  sortBy: 'created_at' | 'deadline_date' | 'title';
  sortOrder: 'asc' | 'desc';
}

interface SubjectState {
  subjects: SubjectWithAchievements[];
  stats: SubjectStats;
  filters: SubjectFilters;
  isLoading: boolean;

  // Actions
  loadSubjects: () => Promise<void>;
  loadStats: () => Promise<void>;
  createSubject: (subject: Omit<Subject, 'id' | 'created_at'>) => Promise<Subject>;
  updateSubject: (id: number, updates: Partial<Subject>) => Promise<Subject>;
  deleteSubject: (id: number) => Promise<void>;
  setFilters: (filters: Partial<SubjectFilters>) => void;

  // Computed getters
  getFilteredSubjects: () => SubjectWithAchievements[];
  getSubjectById: (id: number) => SubjectWithAchievements | undefined;
  
  // Business logic methods
  calculateProgress: (subject: Subject) => number;
  isOverdue: (subject: Subject) => boolean;
  isDueSoon: (subject: Subject) => boolean;
  getStatusLabel: (status: SubjectStatus) => string;
  getStatusColor: (status: SubjectStatus) => string;
}

const initialFilters: SubjectFilters = {
  search: '',
  status: 'all',
  sortBy: 'created_at',
  sortOrder: 'desc',
};

const initialStats: SubjectStats = {
  total: 0,
  preparing: 0,
  launched: 0,
  finished: 0,
  dueSoon: 0,
};

export const useSubjectStore = create<SubjectState>((set, get) => ({
  subjects: [],
  stats: initialStats,
  filters: initialFilters,
  isLoading: false,

  loadSubjects: async () => {
    set({ isLoading: true });
    
    const { data, error } = await supabase
      .from('subjects')
      .select(`
        *,
        achievements(count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      set({ isLoading: false });
      throw error;
    }

    set({ subjects: data || [], isLoading: false });
  },

  loadStats: async () => {
    const { data, error } = await supabase
      .from('subjects')
      .select('status, deadline_date');

    if (error) throw error;

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

    set({ stats });
  },

  createSubject: async (subject: Omit<Subject, 'id' | 'created_at'>) => {
    set({ isLoading: true });
    
    const { data, error } = await supabase
      .from('subjects')
      .insert(subject)
      .select()
      .single();

    if (error) {
      set({ isLoading: false });
      throw error;
    }

    // Refresh subjects and stats
    await Promise.all([get().loadSubjects(), get().loadStats()]);
    
    set({ isLoading: false });
    return data;
  },

  updateSubject: async (id: number, updates: Partial<Subject>) => {
    set({ isLoading: true });
    
    const { data, error } = await supabase
      .from('subjects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      set({ isLoading: false });
      throw error;
    }

    // Update local state
    set(state => ({
      subjects: state.subjects.map(s => 
        s.id === id ? { ...s, ...updates } : s
      ),
      isLoading: false
    }));

    // Refresh stats
    await get().loadStats();
    
    return data;
  },

  deleteSubject: async (id: number) => {
    set({ isLoading: true });
    
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);

    if (error) {
      set({ isLoading: false });
      throw error;
    }

    // Update local state
    set(state => ({
      subjects: state.subjects.filter(s => s.id !== id),
      isLoading: false
    }));

    // Refresh stats
    await get().loadStats();
  },

  setFilters: (newFilters: Partial<SubjectFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  getFilteredSubjects: () => {
    const { subjects, filters } = get();
    
    return subjects
      .filter((subject) => {
        // 搜索过滤
        if (filters.search && !subject.title?.toLowerCase().includes(filters.search.toLowerCase())) {
          return false;
        }
        
        // 状态过滤
        if (filters.status !== 'all' && subject.status !== filters.status) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        const { sortBy, sortOrder } = filters;
        let aValue: string, bValue: string;
        
        switch (sortBy) {
          case 'title':
            aValue = a.title || '';
            bValue = b.title || '';
            break;
          case 'deadline_date':
            aValue = a.deadline_date || '9999-12-31';
            bValue = b.deadline_date || '9999-12-31';
            break;
          case 'created_at':
          default:
            aValue = a.created_at;
            bValue = b.created_at;
            break;
        }
        
        if (sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
  },

  getSubjectById: (id: number) => {
    const { subjects } = get();
    return subjects.find(s => s.id === id);
  },

  calculateProgress: (subject: Subject) => {
    if (!subject.kickoff_date || !subject.deadline_date) return 0;
    
    const now = new Date();
    const start = new Date(subject.kickoff_date);
    const end = new Date(subject.deadline_date);
    
    if (now <= start) return 0;
    if (now >= end) return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.round((elapsed / total) * 100);
  },

  isOverdue: (subject: Subject) => {
    if (!subject.deadline_date || subject.status !== 'launched') return false;
    return new Date(subject.deadline_date) < new Date();
  },

  isDueSoon: (subject: Subject) => {
    if (!subject.deadline_date || subject.status !== 'launched') return false;
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return new Date(subject.deadline_date) <= sevenDaysFromNow;
  },

  getStatusLabel: (status: SubjectStatus) => {
    const labels = {
      preparing: '准备中',
      launched: '进行中',
      finished: '已完成',
    };
    return labels[status || 'preparing'];
  },

  getStatusColor: (status: SubjectStatus) => {
    const colors = {
      preparing: 'preparing',
      launched: 'launched',
      finished: 'finished',
    };
    return colors[status || 'preparing'];
  },
}));