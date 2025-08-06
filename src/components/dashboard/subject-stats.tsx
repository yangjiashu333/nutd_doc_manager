import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Play, CheckCircle, AlertTriangle } from 'lucide-react';
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
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    description: '所有课题总数'
  },
  {
    title: '准备中',
    key: 'preparing' as keyof SubjectStats,
    icon: Play,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    description: '正在筹备的课题'
  },
  {
    title: '进行中',
    key: 'launched' as keyof SubjectStats,
    icon: Play,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: '正在执行的课题'
  },
  {
    title: '已完成',
    key: 'finished' as keyof SubjectStats,
    icon: CheckCircle,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    description: '已经完成的课题'
  },
  {
    title: '即将到期',
    key: 'dueSoon' as keyof SubjectStats,
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: '7天内到期的课题'
  }
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
              <div className={`${card.bgColor} p-2 rounded`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
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
        const shouldHighlight = card.key === 'dueSoon' && value > 0;
        
        return (
          <Card key={card.key} className={shouldHighlight ? 'ring-2 ring-orange-200' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
                {shouldHighlight && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    需关注
                  </Badge>
                )}
              </CardTitle>
              <div className={`${card.bgColor} p-2 rounded`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}