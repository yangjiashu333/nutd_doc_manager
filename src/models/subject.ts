import { create } from 'zustand';
import { subjectsService } from '@/services';
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

    try {
      const data = await subjectsService.getSubjects();
      set({ subjects: data, isLoading: false });
    } finally {
      set({ isLoading: false });
    }
  },

  loadStats: async () => {
    const stats = await subjectsService.getSubjectStats();
    set({ stats });
  },

  createSubject: async (subject: Omit<Subject, 'id' | 'created_at'>) => {
    set({ isLoading: true });

    try {
      const data = await subjectsService.createSubject({
        title: subject.title || '',
        owner_id: subject.owner_id || '',
        status: subject.status,
        kickoff_date: subject.kickoff_date,
        deadline_date: subject.deadline_date,
      });
      // Refresh subjects and stats
      await Promise.all([get().loadSubjects(), get().loadStats()]);
      return data;
    } finally {
      set({ isLoading: false });
    }
  },

  updateSubject: async (id: number, updates: Partial<Subject>) => {
    set({ isLoading: true });
    try {
      const data = await subjectsService.updateSubject(id, {
        title: updates.title,
        status: updates.status,
        kickoff_date: updates.kickoff_date,
        deadline_date: updates.deadline_date,
        owner_id: updates.owner_id,
      });
      // Refresh subjects and stats
      await Promise.all([get().loadSubjects(), get().loadStats()]);
      return data;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSubject: async (id: number) => {
    set({ isLoading: true });
    try {
      await subjectsService.deleteSubject(id);
      // Update local state
      set((state) => ({
        subjects: state.subjects.filter((s) => s.id !== id),
        isLoading: false,
      }));
      // Refresh stats
      await get().loadStats();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  setFilters: (newFilters: Partial<SubjectFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  getFilteredSubjects: () => {
    const { subjects, filters } = get();
    return subjects
      .filter((subject) => {
        // 搜索过滤
        if (
          filters.search &&
          !subject.title?.toLowerCase().includes(filters.search.toLowerCase())
        ) {
          return false;
        }
        // 状态过滤
        if (filters.status !== 'all' && subject.status !== filters.status) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        // 默认按创建时间降序排列，最新的在最上面
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  },

  getSubjectById: (id: number) => {
    const { subjects } = get();
    return subjects.find((s) => s.id === id);
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
