'use client';

import { useMemo } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import {
  ReportType,
  type SupplierReportRow,
  type ClientReportRow,
  type DailySummaryRow
} from '@/types/report';
import { format } from 'date-fns';

type ReportRow = SupplierReportRow | ClientReportRow | DailySummaryRow;

interface ReportTableProps {
  data: ReportRow[];
  type: ReportType;
  totalAmount: number;
}

const statusColors: Record<string, string> = {
  IN_POOL: 'bg-gray-500',
  ASSIGNED: 'bg-blue-500',
  STARTED: 'bg-yellow-500',
  PICKED: 'bg-orange-500',
  COMPLETED: 'bg-green-500',
  CANCELLED: 'bg-red-500',
  FAILED: 'bg-red-600'
};

export function ReportTable({ data, type, totalAmount }: ReportTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns: ColumnDef<ReportRow>[] = useMemo(() => {
    const baseColumns: ColumnDef<ReportRow>[] = [
      {
        accessorKey: 'guestName',
        header: 'Guest Name',
        cell: ({ row }) => (
          <div className='font-medium'>{row.getValue('guestName')}</div>
        )
      },
      {
        accessorKey: 'guestContact',
        header: 'Contact'
      },
      {
        accessorKey: 'pickup',
        header: 'Pickup'
      },
      {
        accessorKey: 'drop',
        header: 'Drop'
      },
      {
        accessorKey: 'pickupTime',
        header: 'Time',
        cell: ({ row }) => row.getValue('pickupTime') || '-'
      },
      {
        accessorKey: 'flight',
        header: 'Flight',
        cell: ({ row }) => row.getValue('flight') || '-'
      },
      {
        accessorKey: 'vehicleModel',
        header: 'Vehicle',
        cell: ({ row }) => row.getValue('vehicleModel') || '-'
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          return (
            <Badge className={statusColors[status] || 'bg-gray-500'}>
              {status.replace('_', ' ')}
            </Badge>
          );
        }
      },
      {
        accessorKey: 'totalAmount',
        header: 'Amount',
        cell: ({ row }) => {
          const amount = row.getValue('totalAmount') as number;
          return `AED ${amount.toFixed(2)}`;
        }
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) => {
          const date = new Date(row.getValue('createdAt'));
          return format(date, 'MMM dd, yyyy HH:mm');
        }
      }
    ];

    // Add type-specific columns
    if (type === ReportType.SUPPLIER) {
      baseColumns.splice(1, 0, {
        accessorKey: 'supplierName',
        header: 'Supplier',
        cell: ({ row }) => (
          <div className='font-medium'>{row.getValue('supplierName')}</div>
        )
      });
      baseColumns.splice(2, 0, {
        accessorKey: 'clientName',
        header: 'Client'
      });
    } else if (type === ReportType.CLIENT) {
      baseColumns.splice(1, 0, {
        accessorKey: 'clientName',
        header: 'Client',
        cell: ({ row }) => (
          <div className='font-medium'>{row.getValue('clientName')}</div>
        )
      });
      baseColumns.splice(2, 0, {
        accessorKey: 'supplierName',
        header: 'Supplier',
        cell: ({ row }) => row.getValue('supplierName') || '-'
      });
    } else if (type === ReportType.DAILY) {
      baseColumns.splice(1, 0, {
        accessorKey: 'clientName',
        header: 'Client'
      });
      baseColumns.splice(2, 0, {
        accessorKey: 'supplierName',
        header: 'Supplier',
        cell: ({ row }) => row.getValue('supplierName') || '-'
      });
    }

    return baseColumns;
  }, [type]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 20
      }
    }
  });

  return (
    <div className='space-y-4'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div className='bg-card rounded-lg border p-4'>
          <div className='text-muted-foreground text-sm font-medium'>
            Total Jobs
          </div>
          <div className='text-2xl font-bold'>{data.length}</div>
        </div>
        <div className='bg-card rounded-lg border p-4'>
          <div className='text-muted-foreground text-sm font-medium'>
            Total Amount
          </div>
          <div className='text-2xl font-bold'>AED {totalAmount.toFixed(2)}</div>
        </div>
        <div className='bg-card rounded-lg border p-4'>
          <div className='text-muted-foreground text-sm font-medium'>
            Average per Job
          </div>
          <div className='text-2xl font-bold'>
            AED{' '}
            {data.length > 0 ? (totalAmount / data.length).toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className='flex items-center gap-2'>
        <Input
          placeholder='Search all columns...'
          value={globalFilter ?? ''}
          onChange={(event) => setGlobalFilter(String(event.target.value))}
          className='max-w-sm'
        />
        {globalFilter && (
          <Button
            variant='ghost'
            onClick={() => setGlobalFilter('')}
            className='px-2 lg:px-3'
          >
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: ' ↑',
                          desc: ' ↓'
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between'>
        <div className='text-muted-foreground text-sm'>
          Showing{' '}
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}{' '}
          to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            data.length
          )}{' '}
          of {data.length} results
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
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
