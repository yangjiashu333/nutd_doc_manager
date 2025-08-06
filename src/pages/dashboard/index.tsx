import { useEffect, useState } from 'react';
import { SubjectStats } from '@/components/dashboard/subject-stats';
import { SubjectFilters } from '@/components/dashboard/subject-filters';
import { SubjectGrid } from '@/components/dashboard/subject-grid';
import { useSubjectStore } from '@/models/subject';

export default function Dashboard() {
  const {
    stats,
    filters,
    isLoading,
    loadSubjects,
    loadStats,
    setFilters,
    getFilteredSubjects
  } = useSubjectStore();

  const [error, setError] = useState<string | null>(null);
  const filteredAndSortedSubjects = getFilteredSubjects();

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        await Promise.all([loadSubjects(), loadStats()]);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '加载数据失败';
        setError(errorMessage);
        console.error('Failed to load dashboard data:', error);
      }
    };
    
    loadData();
  }, [loadSubjects, loadStats]);

  const handleCreateNew = async () => {
    try {
      setError(null);
      // TODO: 实现创建新课题功能
      console.log('Create new subject');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建课题失败';
      setError(errorMessage);
    }
  };

  const handleEditSubject = async (id: number) => {
    try {
      setError(null);
      // TODO: 实现编辑课题功能
      console.log('Edit subject:', id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '编辑课题失败';
      setError(errorMessage);
    }
  };

  const handleViewSubject = (id: number) => {
    // TODO: 实现查看课题详情功能
    console.log('View subject:', id);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">课题管理</h1>
        <p className="text-muted-foreground mt-2">
          管理和跟踪您的研究课题进展
        </p>
      </div>

      {/* 统计概览 */}
      <SubjectStats stats={stats} isLoading={isLoading} />

      {/* 筛选和搜索 */}
      <SubjectFilters
        filters={filters}
        onFiltersChange={setFilters}
        onCreateNew={handleCreateNew}
      />

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}

      {/* 课题网格 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            课题列表 ({filteredAndSortedSubjects.length})
          </h2>
        </div>
        
        <SubjectGrid
          subjects={filteredAndSortedSubjects}
          onEditSubject={handleEditSubject}
          onViewSubject={handleViewSubject}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
