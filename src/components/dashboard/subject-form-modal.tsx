import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { subjectFormSchema, type SubjectFormData } from '@/lib/validations/subject';
import type { SubjectWithAchievements } from '@/models/subject';
import { cn } from '@/lib/utils';

interface SubjectFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: SubjectWithAchievements | null;
  onSubmit: (data: SubjectFormData) => Promise<void>;
  isSubmitting?: boolean;
}

const statusOptions = [
  { value: 'preparing', label: '准备中' },
  { value: 'launched', label: '进行中' },
  { value: 'finished', label: '已完成' },
];

export function SubjectFormModal({
  open,
  onOpenChange,
  subject,
  onSubmit,
  isSubmitting = false,
}: SubjectFormModalProps) {
  const isEditing = !!subject;

  const form = useForm<SubjectFormData>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      title: '',
      status: 'preparing',
      kickoff_date: '',
      deadline_date: '',
    },
  });

  // 更新表单默认值
  useEffect(() => {
    if (subject) {
      form.reset({
        title: subject.title || '',
        status: subject.status || 'preparing',
        kickoff_date: subject.kickoff_date || '',
        deadline_date: subject.deadline_date || '',
      });
    } else {
      form.reset({
        title: '',
        status: 'preparing',
        kickoff_date: '',
        deadline_date: '',
      });
    }
  }, [subject, form]);

  const handleSubmit = async (data: SubjectFormData) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? '编辑课题' : '新建课题'}</DialogTitle>
          <DialogDescription>{isEditing ? '修改课题信息' : '填写课题基本信息'}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>课题标题</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入课题标题" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>状态</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择状态" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kickoff_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>开始日期</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), 'yyyy-MM-dd', { locale: zhCN })
                          ) : (
                            <span>选择开始日期</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                        }}
                        locale={zhCN}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deadline_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>截止日期</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), 'yyyy-MM-dd', { locale: zhCN })
                          ) : (
                            <span>选择截止日期</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                        }}
                        locale={zhCN}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '保存中...' : isEditing ? '更新' : '创建'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
