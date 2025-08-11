import { useEffect, useState } from 'react';
import { SubjectStats } from '@/components/dashboard/subject-stats';
import { SubjectDataTable } from '@/components/dashboard/subject-data-table';
import { SubjectFormModal } from '@/components/dashboard/subject-form-modal';
import { DeleteSubjectModal } from '@/components/dashboard/delete-subject-modal';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useSubjectStore, type SubjectWithAchievements } from '@/models/subject';
import { useAuthStore } from '@/models/auth';
import type { SubjectFormData } from '@/lib/validations/subject';
import { toast } from 'sonner';

const statusOptions = [
  { value: 'all' as const, label: '全部' },
  { value: 'preparing' as const, label: '准备中' },
  { value: 'launched' as const, label: '进行中' },
  { value: 'finished' as const, label: '已完成' },
];

export default function Dashboard() {
  const {
    stats,
    filters,
    isLoading,
    loadSubjects,
    loadStats,
    setFilters,
    getFilteredSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    getSubjectById,
  } = useSubjectStore();
  const { user } = useAuthStore();

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectWithAchievements | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<SubjectWithAchievements | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredAndSortedSubjects = getFilteredSubjects();

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([loadSubjects(), loadStats()]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    loadData();
  }, [loadSubjects, loadStats]);

  const handleCreateNew = () => {
    setEditingSubject(null);
    setFormModalOpen(true);
  };

  const handleEditSubject = (id: number) => {
    const subject = getSubjectById(id);
    if (subject) {
      setEditingSubject(subject);
      setFormModalOpen(true);
    }
  };

  const handleDeleteSubject = (id: number) => {
    const subject = getSubjectById(id);
    if (subject) {
      setDeletingSubject(subject);
      setDeleteModalOpen(true);
    }
  };

  const handleFormSubmit = async (data: SubjectFormData) => {
    if (!user?.id) {
      toast.error('用户未登录');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingSubject) {
        // 编辑模式
        await updateSubject(editingSubject.id, {
          title: data.title,
          owner_id: data.owner_id === 'no-owner' ? null : data.owner_id,
          status: data.status,
          kickoff_date: data.kickoff_date || null,
          deadline_date: data.deadline_date || null,
        });
        toast.success('课题更新成功');
      } else {
        // 创建模式
        await createSubject({
          title: data.title,
          owner_id: data.owner_id === 'no-owner' ? null : data.owner_id,
          status: data.status,
          kickoff_date: data.kickoff_date || null,
          deadline_date: data.deadline_date || null,
        });
        toast.success('课题创建成功');
      }
      setFormModalOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : '操作失败，请稍后重试';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSubject) return;

    setIsDeleting(true);
    try {
      await deleteSubject(deletingSubject.id);
      toast.success('课题删除成功');
      setDeleteModalOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除失败，请稍后重试';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 统计概览 */}
      <SubjectStats stats={stats} isLoading={isLoading} />

      {/* 筛选和搜索 */}
      <div className="flex gap-4 items-center">
        <div>
          <Input
            placeholder="搜索课题标题..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        <div className="flex-1">
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              setFilters({ ...filters, status: value as typeof filters.status })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          新建课题
        </Button>
      </div>

      {/* 课题数据表格 */}
      <div>
        <SubjectDataTable
          subjects={filteredAndSortedSubjects}
          onEditSubject={handleEditSubject}
          onDeleteSubject={handleDeleteSubject}
          isLoading={isLoading}
        />
      </div>

      {/* 课题表单Modal */}
      <SubjectFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        subject={editingSubject}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      {/* 删除确认Modal */}
      <DeleteSubjectModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        subject={deletingSubject}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
