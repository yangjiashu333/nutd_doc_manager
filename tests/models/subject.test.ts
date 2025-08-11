import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { useSubjectStore } from '../../src/models/subject';
import {
  testSupabase,
  cleanupTestData,
  waitForAsyncUpdates,
  verifyDatabaseState,
} from '../setup/database';
import '../setup';

// 测试课题数据
const testSubjects = {
  subject1: {
    title: '人工智能算法研究',
    status: 'preparing' as const,
    kickoff_date: '2024-02-01',
    deadline_date: '2024-08-01',
    owner_id: null,
  },
  subject2: {
    title: '机器学习模型优化',
    status: 'launched' as const,
    kickoff_date: '2024-01-15',
    deadline_date: '2024-07-15',
    owner_id: null,
  },
  subject3: {
    title: '深度学习应用开发',
    status: 'finished' as const,
    kickoff_date: '2023-09-01',
    deadline_date: '2023-12-31',
    owner_id: null,
  },
  dueSoonSubject: {
    title: '即将到期的课题',
    status: 'launched' as const,
    kickoff_date: '2024-01-01',
    deadline_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3天后
    owner_id: null,
  },
};

// 创建测试课题的工具函数
async function createTestSubject(subjectKey: keyof typeof testSubjects) {
  const subjectData = testSubjects[subjectKey];

  const { data, error } = await testSupabase.from('subjects').insert(subjectData).select().single();

  if (error) throw error;
  return data;
}

// 清理测试课题数据
async function cleanupTestSubjects() {
  try {
    const titlePrefixes = ['人工智能', '机器学习', '深度学习', '即将到期', '测试课题'];

    for (const prefix of titlePrefixes) {
      await testSupabase.from('subjects').delete().like('title', `${prefix}%`);
    }

    // 清理achievements表中相关数据
    await testSupabase.from('achievements').delete().is('subject_id', null);

    console.log('✅ 测试课题数据清理完成');
  } catch (error) {
    console.warn('⚠️ 测试课题数据清理失败:', error);
  }
}

describe('Subject Store - 集成测试', () => {
  beforeAll(async () => {
    // 验证数据库连接
    const isConnected = await verifyDatabaseState();
    if (!isConnected) {
      throw new Error('无法连接到测试数据库');
    }
  });

  beforeEach(async () => {
    // 清理测试数据
    await cleanupTestSubjects();
    await cleanupTestData();

    // 重置 store 状态
    useSubjectStore.setState({
      subjects: [],
      stats: {
        total: 0,
        preparing: 0,
        launched: 0,
        finished: 0,
        dueSoon: 0,
      },
      filters: {
        search: '',
        status: 'all',
        sortBy: 'created_at',
        sortOrder: 'desc',
      },
      isLoading: false,
    });
  });

  afterAll(async () => {
    // 测试结束后清理数据
    await cleanupTestSubjects();
    await cleanupTestData();
  });

  describe('初始状态', () => {
    it('应该有正确的默认状态', () => {
      const state = useSubjectStore.getState();
      expect(state.subjects).toEqual([]);
      expect(state.stats.total).toBe(0);
      expect(state.stats.preparing).toBe(0);
      expect(state.stats.launched).toBe(0);
      expect(state.stats.finished).toBe(0);
      expect(state.stats.dueSoon).toBe(0);
      expect(state.filters.search).toBe('');
      expect(state.filters.status).toBe('all');
      expect(state.filters.sortBy).toBe('created_at');
      expect(state.filters.sortOrder).toBe('desc');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('loadSubjects 方法', () => {
    it('应该成功加载课题列表', async () => {
      // 创建测试课题
      await createTestSubject('subject1');
      await createTestSubject('subject2');

      const { loadSubjects } = useSubjectStore.getState();
      await loadSubjects();

      const state = useSubjectStore.getState();
      expect(state.subjects).toHaveLength(2);
      expect(state.isLoading).toBe(false);

      const titles = state.subjects.map((s) => s.title);
      expect(titles).toContain('人工智能算法研究');
      expect(titles).toContain('机器学习模型优化');
    });

    it('应该按创建时间降序排列课题', async () => {
      // 创建课题（有时间间隔确保不同的创建时间）
      await createTestSubject('subject1');
      await waitForAsyncUpdates(100);
      await createTestSubject('subject2');

      const { loadSubjects } = useSubjectStore.getState();
      await loadSubjects();

      const state = useSubjectStore.getState();
      expect(state.subjects).toHaveLength(2);

      // 最新创建的应该在前面
      expect(state.subjects[0].title).toBe('机器学习模型优化');
      expect(state.subjects[1].title).toBe('人工智能算法研究');
    });

    it('数据库错误时应该抛出异常', async () => {
      // 使用错误的表名来触发数据库错误
      const originalSelect = testSupabase.from;
      testSupabase.from = (() => {
        throw new Error('Database connection failed');
      }) as typeof testSupabase.from;

      const { loadSubjects } = useSubjectStore.getState();

      await expect(loadSubjects()).rejects.toThrow();

      const state = useSubjectStore.getState();
      expect(state.isLoading).toBe(false);

      // 恢复原始方法
      testSupabase.from = originalSelect;
    });
  });

  describe('loadStats 方法', () => {
    it('应该正确计算课题统计信息', async () => {
      // 创建不同状态的课题
      await createTestSubject('subject1'); // preparing
      await createTestSubject('subject2'); // launched
      await createTestSubject('subject3'); // finished
      await createTestSubject('dueSoonSubject'); // launched, due soon

      const { loadStats } = useSubjectStore.getState();
      await loadStats();

      const state = useSubjectStore.getState();
      expect(state.stats.total).toBe(4);
      expect(state.stats.preparing).toBe(1);
      expect(state.stats.launched).toBe(2);
      expect(state.stats.finished).toBe(1);
      expect(state.stats.dueSoon).toBe(1); // dueSoonSubject
    });

    it('空数据库应该返回零统计', async () => {
      const { loadStats } = useSubjectStore.getState();
      await loadStats();

      const state = useSubjectStore.getState();
      expect(state.stats.total).toBe(0);
      expect(state.stats.preparing).toBe(0);
      expect(state.stats.launched).toBe(0);
      expect(state.stats.finished).toBe(0);
      expect(state.stats.dueSoon).toBe(0);
    });
  });

  describe('createSubject 方法', () => {
    it('应该成功创建新课题', async () => {
      const { createSubject } = useSubjectStore.getState();
      const newSubject = {
        title: '新创建的测试课题',
        status: 'preparing' as const,
        kickoff_date: '2024-03-01',
        deadline_date: '2024-09-01',
        owner_id: null,
      };

      const created = await createSubject(newSubject);

      expect(created.title).toBe(newSubject.title);
      expect(created.status).toBe(newSubject.status);
      expect(created.id).toBeDefined();
      expect(created.created_at).toBeDefined();

      const state = useSubjectStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.subjects).toHaveLength(1);
      expect(state.subjects[0].title).toBe(newSubject.title);
    });

    it('创建后应该自动刷新统计信息', async () => {
      const { createSubject } = useSubjectStore.getState();
      const newSubject = {
        title: '测试课题统计更新',
        status: 'preparing' as const,
        kickoff_date: '2024-03-01',
        deadline_date: '2024-09-01',
        owner_id: null,
      };

      await createSubject(newSubject);

      const state = useSubjectStore.getState();
      expect(state.stats.total).toBe(1);
      expect(state.stats.preparing).toBe(1);
    });
  });

  describe('updateSubject 方法', () => {
    it('应该成功更新课题信息', async () => {
      // 先创建一个课题
      const created = await createTestSubject('subject1');

      // 更新课题
      const { updateSubject } = useSubjectStore.getState();
      const updates = {
        title: '更新后的课题标题',
        status: 'launched' as const,
      };

      const updated = await updateSubject(created.id, updates);

      expect(updated.title).toBe(updates.title);
      expect(updated.status).toBe(updates.status);
      expect(updated.id).toBe(created.id);
    });

    it('更新后应该自动刷新统计信息', async () => {
      const created = await createTestSubject('subject1'); // preparing

      // 初始统计
      const { updateSubject, loadStats } = useSubjectStore.getState();
      await loadStats();

      let state = useSubjectStore.getState();
      expect(state.stats.preparing).toBe(1);
      expect(state.stats.launched).toBe(0);

      // 更新状态
      await updateSubject(created.id, { status: 'launched' });

      state = useSubjectStore.getState();
      expect(state.stats.preparing).toBe(0);
      expect(state.stats.launched).toBe(1);
    });

    it('更新不存在的课题应该抛出错误', async () => {
      const { updateSubject } = useSubjectStore.getState();

      await expect(updateSubject(99999, { title: '不存在的课题' })).rejects.toThrow();

      const state = useSubjectStore.getState();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('deleteSubject 方法', () => {
    it('应该成功删除课题', async () => {
      const created = await createTestSubject('subject1');

      // 加载课题列表
      const { deleteSubject, loadSubjects } = useSubjectStore.getState();
      await loadSubjects();

      let state = useSubjectStore.getState();
      expect(state.subjects).toHaveLength(1);

      // 删除课题
      await deleteSubject(created.id);

      state = useSubjectStore.getState();
      expect(state.subjects).toHaveLength(0);
      expect(state.isLoading).toBe(false);
    });

    it('删除后应该自动刷新统计信息', async () => {
      const created = await createTestSubject('subject1');

      const { deleteSubject, loadStats } = useSubjectStore.getState();
      await loadStats();

      let state = useSubjectStore.getState();
      expect(state.stats.total).toBe(1);

      await deleteSubject(created.id);

      state = useSubjectStore.getState();
      expect(state.stats.total).toBe(0);
    });
  });

  describe('setFilters 方法', () => {
    it('应该正确设置筛选条件', () => {
      const { setFilters } = useSubjectStore.getState();

      setFilters({
        search: '测试搜索',
        status: 'launched',
        sortBy: 'title',
        sortOrder: 'asc',
      });

      const state = useSubjectStore.getState();
      expect(state.filters.search).toBe('测试搜索');
      expect(state.filters.status).toBe('launched');
      expect(state.filters.sortBy).toBe('title');
      expect(state.filters.sortOrder).toBe('asc');
    });

    it('应该支持部分更新筛选条件', () => {
      const { setFilters } = useSubjectStore.getState();

      // 只更新搜索条件
      setFilters({ search: '部分更新' });

      const state = useSubjectStore.getState();
      expect(state.filters.search).toBe('部分更新');
      expect(state.filters.status).toBe('all'); // 保持默认值
      expect(state.filters.sortBy).toBe('created_at'); // 保持默认值
    });
  });

  describe('getFilteredSubjects 方法', () => {
    beforeEach(async () => {
      // 创建多个测试课题
      await createTestSubject('subject1');
      await createTestSubject('subject2');
      await createTestSubject('subject3');

      const { loadSubjects } = useSubjectStore.getState();
      await loadSubjects();
    });

    it('应该根据搜索条件过滤课题', () => {
      const { setFilters, getFilteredSubjects } = useSubjectStore.getState();

      setFilters({ search: '人工智能' });
      const filtered = getFilteredSubjects();

      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toContain('人工智能');
    });

    it('应该根据状态过滤课题', () => {
      const { setFilters, getFilteredSubjects } = useSubjectStore.getState();

      setFilters({ status: 'launched' });
      const filtered = getFilteredSubjects();

      expect(filtered).toHaveLength(1);
      expect(filtered[0].status).toBe('launched');
    });

    it('应该根据标题排序', () => {
      const { setFilters, getFilteredSubjects } = useSubjectStore.getState();

      setFilters({ sortBy: 'title', sortOrder: 'asc' });
      const filtered = getFilteredSubjects();

      expect(filtered).toHaveLength(3);
      expect(filtered[0].title).toBe('人工智能算法研究');
      expect(filtered[1].title).toBe('机器学习模型优化');
      expect(filtered[2].title).toBe('深度学习应用开发');
    });

    it('应该支持组合筛选条件', () => {
      const { setFilters, getFilteredSubjects } = useSubjectStore.getState();

      setFilters({
        search: '学习',
        status: 'all',
        sortBy: 'title',
        sortOrder: 'desc',
      });
      const filtered = getFilteredSubjects();

      expect(filtered).toHaveLength(2); // 机器学习 + 深度学习
      expect(filtered[0].title).toBe('深度学习应用开发');
      expect(filtered[1].title).toBe('机器学习模型优化');
    });
  });

  describe('业务逻辑方法', () => {
    it('calculateProgress 应该正确计算进度', () => {
      const { calculateProgress } = useSubjectStore.getState();

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const subject = {
        kickoff_date: thirtyDaysAgo.toISOString().split('T')[0],
        deadline_date: thirtyDaysFromNow.toISOString().split('T')[0],
      } as Parameters<typeof calculateProgress>[0];

      const progress = calculateProgress(subject);
      expect(progress).toBeGreaterThanOrEqual(49);
      expect(progress).toBeLessThanOrEqual(51); // 允许1%的误差
    });

    it('isOverdue 应该正确判断课题是否逾期', () => {
      const { isOverdue } = useSubjectStore.getState();

      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const overdueSubject = {
        status: 'launched' as const,
        deadline_date: yesterday.toISOString().split('T')[0],
      } as Parameters<typeof isOverdue>[0];

      expect(isOverdue(overdueSubject)).toBe(true);

      const finishedSubject = {
        status: 'finished' as const,
        deadline_date: yesterday.toISOString().split('T')[0],
      } as Parameters<typeof isOverdue>[0];

      expect(isOverdue(finishedSubject)).toBe(false);
    });

    it('isDueSoon 应该正确判断课题是否即将到期', () => {
      const { isDueSoon } = useSubjectStore.getState();

      const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      const dueSoonSubject = {
        status: 'launched' as const,
        deadline_date: threeDaysFromNow.toISOString().split('T')[0],
      } as Parameters<typeof isDueSoon>[0];

      expect(isDueSoon(dueSoonSubject)).toBe(true);

      const farFutureSubject = {
        status: 'launched' as const,
        deadline_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      } as Parameters<typeof isDueSoon>[0];

      expect(isDueSoon(farFutureSubject)).toBe(false);
    });

    it('getStatusLabel 应该返回正确的状态标签', () => {
      const { getStatusLabel } = useSubjectStore.getState();

      expect(getStatusLabel('preparing')).toBe('准备中');
      expect(getStatusLabel('launched')).toBe('进行中');
      expect(getStatusLabel('finished')).toBe('已完成');
    });

    it('getStatusColor 应该返回正确的状态颜色', () => {
      const { getStatusColor } = useSubjectStore.getState();

      expect(getStatusColor('preparing')).toBe('preparing');
      expect(getStatusColor('launched')).toBe('launched');
      expect(getStatusColor('finished')).toBe('finished');
    });
  });

  describe('getSubjectById 方法', () => {
    it('应该根据ID找到对应课题', async () => {
      const created = await createTestSubject('subject1');

      const { loadSubjects, getSubjectById } = useSubjectStore.getState();
      await loadSubjects();

      const found = getSubjectById(created.id);
      expect(found).toBeDefined();
      expect(found?.title).toBe('人工智能算法研究');
    });

    it('找不到课题时应该返回undefined', async () => {
      const { loadSubjects, getSubjectById } = useSubjectStore.getState();
      await loadSubjects();

      const notFound = getSubjectById(99999);
      expect(notFound).toBeUndefined();
    });
  });
});
