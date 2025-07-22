import type { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { ArrowUpDown, MoreHorizontal, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export type Project = {
  id: string;
  name: string;
  owner: string;
  status: 'preparing' | 'launched' | 'finished';
  kickoffDate?: string;
  deadlineDate?: string;
  createTime: string;
  updateTime: string;
};

// 提取Status类型以确保类型一致性
type Status = Project['status'];

export const columns: ColumnDef<Project>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Project Name
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'owner',
    header: 'Owner',
    cell: ({ row }) => <div>{row.getValue('owner')}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as Status;
      const statusStyles: Record<Status, string> = {
        preparing: 'bg-yellow-100 text-yellow-800',
        launched: 'bg-green-100 text-green-800',
        finished: 'bg-gray-100 text-gray-800',
      };
      return (
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      );
    },
  },
  {
    accessorKey: 'kickoffDate',
    header: 'Kickoff Date',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Calendar className="h-3.5 w-3.5" />
        {row.getValue('kickoffDate') || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'deadlineDate',
    header: 'Deadline',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Calendar className="h-3.5 w-3.5" />
        {row.getValue('deadlineDate') || '-'}
      </div>
    ),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const project = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(project.id)}>
              Copy project ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit project</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
