import { SubjectCard } from './subject-card';
import type { SubjectWithAchievements } from '@/models/subject';

interface SubjectGridProps {
  subjects: SubjectWithAchievements[];
  onEditSubject?: (id: number) => void;
  onViewSubject?: (id: number) => void;
  isLoading?: boolean;
}

export function SubjectGrid({ 
  subjects, 
  onEditSubject, 
  onViewSubject, 
  isLoading = false 
}: SubjectGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-muted rounded-lg h-64"></div>
          </div>
        ))}
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-1">暂无课题</h3>
        <p className="text-muted-foreground">还没有创建任何课题，点击"新建课题"开始吧</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subjects.map((subject) => (
        <SubjectCard
          key={subject.id}
          subject={subject}
          onEdit={onEditSubject}
          onView={onViewSubject}
        />
      ))}
    </div>
  );
}