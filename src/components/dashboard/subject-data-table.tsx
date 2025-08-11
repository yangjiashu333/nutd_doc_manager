import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SubjectWithAchievements } from '@/models/subject';

interface SubjectDataTableProps {
  subjects: SubjectWithAchievements[];
  isLoading?: boolean;
  onEditSubject: (id: number) => void;
  onDeleteSubject: (id: number) => void;
}

const statusLabels = {
  preparing: '准备中',
  launched: '进行中',
  finished: '已完成',
} as const;

const statusColors = {
  preparing: 'bg-blue-100 text-blue-800',
  launched: 'bg-green-100 text-green-800',
  finished: 'bg-gray-100 text-gray-800',
} as const;

export function SubjectDataTable({
  subjects,
  isLoading = false,
  onEditSubject,
  onDeleteSubject,
}: SubjectDataTableProps) {
  const columns: ColumnDef<SubjectWithAchievements>[] = [
    {
      accessorKey: 'title',
      header: '课题名',
      cell: ({ row }) => (
        <div className="max-w-xs truncate">{row.getValue('title') || '未命名课题'}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => {
        const status = row.getValue('status') as keyof typeof statusLabels;
        return (
          <span
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
              statusColors[status] || statusColors.preparing
            }`}
          >
            {statusLabels[status] || '准备中'}
          </span>
        );
      },
    },
    {
      accessorKey: 'profiles',
      header: '负责人',
      cell: ({ row }) => {
        const profiles = row.getValue('profiles') as { name: string | null } | null;
        return profiles?.name || '未分配';
      },
    },
    {
      accessorKey: 'kickoff_date',
      header: '开始日期',
      cell: ({ row }) => {
        const date = row.getValue('kickoff_date') as string;
        return date ? new Date(date).toLocaleDateString('zh-CN') : '-';
      },
    },
    {
      accessorKey: 'deadline_date',
      header: '截止日期',
      cell: ({ row }) => {
        const date = row.getValue('deadline_date') as string;
        return date ? new Date(date).toLocaleDateString('zh-CN') : '-';
      },
    },
    // {
    //   accessorKey: 'created_at',
    //   header: '创建时间',
    //   cell: ({ row }) => {
    //     const date = row.getValue('created_at') as string;
    //     return new Date(date).toLocaleDateString('zh-CN');
    //   },
    // },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">打开菜单</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditSubject(row.original.id)}>
              <Edit className="mr-2 h-4 w-4" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDeleteSubject(row.original.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: subjects,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-4 bg-muted animate-pulse rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                暂无数据
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
