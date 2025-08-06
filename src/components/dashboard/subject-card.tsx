import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, FileText, Edit, Eye } from 'lucide-react';
import { useSubjectStore, type SubjectWithAchievements } from '@/models/subject';

interface SubjectCardProps {
  subject: SubjectWithAchievements;
  onEdit?: (id: number) => void;
  onView?: (id: number) => void;
}

function formatDate(dateString: string | null) {
  if (!dateString) return '未设置';
  return new Date(dateString).toLocaleDateString('zh-CN');
}

export function SubjectCard({ subject, onEdit, onView }: SubjectCardProps) {
  const { calculateProgress, isOverdue, isDueSoon, getStatusLabel, getStatusColor } = useSubjectStore();
  
  const progress = calculateProgress(subject);
  const overdue = isOverdue(subject);
  const dueSoon = isDueSoon(subject);

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold line-clamp-2 flex-1">
            {subject.title || '未命名课题'}
          </CardTitle>
          <div className="flex flex-col gap-1">
            <Badge variant={getStatusColor(subject.status) as 'preparing' | 'launched' | 'finished'}>
              {getStatusLabel(subject.status)}
            </Badge>
            {overdue && (
              <Badge variant="destructive" className="text-xs">
                已逾期
              </Badge>
            )}
            {dueSoon && !overdue && (
              <Badge variant="secondary" className="text-xs">
                即将到期
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* 时间信息 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDate(subject.kickoff_date)} - {formatDate(subject.deadline_date)}
            </span>
          </div>
          
          {/* 进度条 */}
          {subject.status === 'launched' && subject.kickoff_date && subject.deadline_date && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>进度</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    overdue ? 'bg-destructive' : dueSoon ? 'bg-orange-500' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 成果统计 */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{subject.achievements?.[0]?.count || 0} 项成果</span>
        </div>

        {/* 负责人信息 */}
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">负</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            {subject.owner_id ? '负责人' : '未分配负责人'}
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onView?.(subject.id)}
        >
          <Eye className="h-4 w-4 mr-1" />
          查看
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit?.(subject.id)}
        >
          <Edit className="h-4 w-4 mr-1" />
          编辑
        </Button>
      </CardFooter>
    </Card>
  );
}