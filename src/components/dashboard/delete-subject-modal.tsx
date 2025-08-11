import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { SubjectWithAchievements } from '@/models/subject';

interface DeleteSubjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: SubjectWithAchievements | null;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

export function DeleteSubjectModal({
  open,
  onOpenChange,
  subject,
  onConfirm,
  isDeleting = false,
}: DeleteSubjectModalProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      // 错误处理在父组件中进行
      console.error('Delete error:', error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除</AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除课题「{subject?.title || '未命名课题'}」吗？此操作无法撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting ? '删除中...' : '删除'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
