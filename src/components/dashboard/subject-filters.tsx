import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, Filter, X, Plus } from 'lucide-react';
import type { SubjectFilters } from '@/models/subject';

interface SubjectFiltersProps {
  filters: SubjectFilters;
  onFiltersChange: (filters: SubjectFilters) => void;
  onCreateNew?: () => void;
}

const statusOptions = [
  { value: 'all' as const, label: '全部状态' },
  { value: 'preparing' as const, label: '准备中' },
  { value: 'launched' as const, label: '进行中' },
  { value: 'finished' as const, label: '已完成' },
];

const sortOptions = [
  { value: 'created_at', label: '创建时间' },
  { value: 'deadline_date', label: '截止时间' },
  { value: 'title', label: '标题' },
] as const;

export function SubjectFilters({ 
  filters, 
  onFiltersChange, 
  onCreateNew 
}: SubjectFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof SubjectFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters = filters.search || filters.status !== 'all' || 
    filters.sortBy !== 'created_at' || filters.sortOrder !== 'desc';

  return (
    <div className="space-y-4">
      {/* 主搜索栏和操作按钮 */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索课题标题..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          筛选
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              !
            </Badge>
          )}
        </Button>

        {onCreateNew && (
          <Button onClick={onCreateNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            新建课题
          </Button>
        )}
      </div>

      {/* 展开的筛选选项 */}
      {isExpanded && (
        <div className="bg-muted/20 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 状态筛选 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">状态</label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value)}
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

            {/* 排序字段 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">排序方式</label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 排序顺序 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">排序顺序</label>
              <Select
                value={filters.sortOrder}
                onValueChange={(value) => handleFilterChange('sortOrder', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">降序</SelectItem>
                  <SelectItem value="asc">升序</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 清除筛选按钮 */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                清除筛选
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}