import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Play, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import type { SubjectStats } from '@/models/subject';

interface SubjectStatsProps {
  stats: SubjectStats;
  isLoading?: boolean;
}

const statCards = [
  {
    title: '总课题数',
    key: 'total' as keyof SubjectStats,
    icon: Briefcase,
    description: '所有课题总数',
  },
  {
    title: '准备中',
    key: 'preparing' as keyof SubjectStats,
    icon: Loader,
    description: '正在筹备的课题',
  },
  {
    title: '进行中',
    key: 'launched' as keyof SubjectStats,
    icon: Play,
    description: '正在执行的课题',
  },
  {
    title: '已完成',
    key: 'finished' as keyof SubjectStats,
    icon: CheckCircle,
    description: '已经完成的课题',
  },
  {
    title: '即将到期',
    key: 'dueSoon' as keyof SubjectStats,
    icon: AlertTriangle,
    description: '7天内到期的课题',
  },
];

export function SubjectStats({ stats, isLoading = false }: SubjectStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <Card key={card.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-12"></div>
                <div className="h-3 bg-muted rounded w-20 mt-2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((card) => {
        const value = stats[card.key];

        return (
          <Card key={card.key}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{card.title}</CardTitle>
              <card.icon />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
