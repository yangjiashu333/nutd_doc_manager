import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import { ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { columns, type Project } from './project-column';

// 将Payment类型替换为Project类型并更新示例数据
const data: Project[] = [
  {
    id: 'proj-001',
    name: 'AI Research Platform',
    owner: 'Dr. Zhang',
    status: 'launched',
    kickoffDate: '2023-09-15',
    deadlineDate: '2024-03-15',
    createTime: '2023-09-01T08:30:00Z',
    updateTime: '2023-11-20T14:22:00Z',
  },
  {
    id: 'proj-002',
    name: 'Data Visualization Tool',
    owner: 'Li Ming',
    status: 'preparing',
    kickoffDate: '2023-11-01',
    deadlineDate: '2024-04-30',
    createTime: '2023-10-15T10:15:00Z',
    updateTime: '2023-10-15T10:15:00Z',
  },
  {
    id: 'proj-003',
    name: 'Blockchain Integration',
    owner: 'Wang Wei',
    status: 'finished',
    kickoffDate: '2023-01-10',
    deadlineDate: '2023-08-20',
    createTime: '2022-12-01T09:00:00Z',
    updateTime: '2023-08-20T16:45:00Z',
  },
  {
    id: 'proj-004',
    name: 'Mobile App Redesign',
    owner: 'Chen Jie',
    status: 'launched',
    kickoffDate: '2023-06-01',
    deadlineDate: '2023-10-30',
    createTime: '2023-05-15T11:30:00Z',
    updateTime: '2023-10-30T15:20:00Z',
  },
  {
    id: 'proj-005',
    name: 'Cloud Infrastructure',
    owner: 'Zhao Yang',
    status: 'launched',
    kickoffDate: '2023-08-20',
    deadlineDate: '2024-01-15',
    createTime: '2023-08-01T09:45:00Z',
    updateTime: '2023-11-10T11:30:00Z',
  },
];

export function ProjectTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter projects..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id === 'name' && 'Project Name'}
                    {column.id === 'owner' && 'Owner'}
                    {column.id === 'status' && 'Status'}
                    {column.id === 'kickoffDate' && 'Kickoff Date'}
                    {column.id === 'deadlineDate' && 'Deadline'}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
