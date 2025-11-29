'use client';

import { useState, useMemo } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { JobStatus } from '@/types/job';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { MessageCircle, Pencil, Eye } from 'lucide-react';
import { formatWhatsAppMessage, copyToClipboard } from '@/lib/utils/whatsapp';
import { toast } from 'sonner';

interface Job {
  id: string;
  guestName: string;
  guestContact: string;
  pickup: string;
  drop: string;
  flight?: string | null;
  pickupTime?: string | null;
  driverName?: string | null;
  assignedPlate?: string | null;
  vehicleModel?: string | null;
  status: JobStatus;
  createdAt: string;
  client: {
    id: string;
    name: string;
  };
  supplier?: {
    id: string;
    name: string;
  } | null;
  price?: number | null;
  totalAmount?: number | null;
}

const statusColors: Record<JobStatus, string> = {
  IN_POOL: 'bg-gray-500',
  ASSIGNED: 'bg-blue-500',
  STARTED: 'bg-yellow-500',
  PICKED: 'bg-orange-500',
  COMPLETED: 'bg-green-500',
  CANCELLED: 'bg-red-500',
  FAILED: 'bg-red-600'
};

const statusLabels: Record<JobStatus, string> = {
  IN_POOL: 'In Pool',
  ASSIGNED: 'Assigned',
  STARTED: 'Started',
  PICKED: 'Picked',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed'
};

export function JobPoolTable({
  jobs,
  onSelectionChange
}: {
  jobs: Job[];
  onSelectionChange?: (selectedIds: string[]) => void;
}) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const columns: ColumnDef<Job>[] = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label='Select all'
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label='Select row'
          />
        ),
        enableSorting: false,
        enableHiding: false
      },
      {
        accessorKey: 'guestName',
        header: 'Guest',
        cell: ({ row }) => (
          <div className='font-medium'>{row.getValue('guestName')}</div>
        )
      },
      {
        accessorKey: 'guestContact',
        header: 'Contact'
      },
      {
        accessorKey: 'client',
        header: 'Client',
        cell: ({ row }) => row.original.client.name
      },
      {
        accessorKey: 'supplier',
        header: 'Supplier',
        cell: ({ row }) => row.original.supplier?.name || '-'
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
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as JobStatus;
          return (
            <Badge className={statusColors[status]}>
              {statusLabels[status]}
            </Badge>
          );
        }
      },
      {
        accessorKey: 'totalAmount',
        header: 'Total',
        cell: ({ row }) => {
          const amount = row.getValue('totalAmount') as number | null;
          return amount ? `AED ${amount.toFixed(2)}` : '-';
        }
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => {
          const date = new Date(row.getValue('createdAt'));
          return format(
            formatInTimeZone(date, 'Asia/Dubai', 'yyyy-MM-dd HH:mm'),
            'MMM dd, yyyy HH:mm'
          );
        }
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const job = row.original;
          const isAssigned = job.status === 'ASSIGNED';

          const handleCopyWhatsApp = async () => {
            const message = formatWhatsAppMessage({
              guestName: job.guestName,
              guestContact: job.guestContact,
              pickup: job.pickup,
              pickupTime: job.pickupTime,
              drop: job.drop,
              flight: job.flight,
              driverName: job.driverName,
              assignedPlate: job.assignedPlate,
              vehicleModel: job.vehicleModel
            });

            const success = await copyToClipboard(message);
            if (success) {
              toast.success('WhatsApp message copied to clipboard');
            } else {
              toast.error('Failed to copy message');
            }
          };

          return (
            <div className='flex gap-2'>
              {isAssigned && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleCopyWhatsApp}
                  title='Copy WhatsApp message'
                >
                  <MessageCircle className='h-4 w-4' />
                </Button>
              )}
              <Button
                variant='ghost'
                size='sm'
                onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                title='View details'
              >
                <Eye className='h-4 w-4' />
              </Button>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false
      }
    ],
    [router]
  );

  const table = useReactTable({
    data: jobs,
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
      rowSelection
    }
  });

  // Notify parent of selection changes
  useMemo(() => {
    if (onSelectionChange) {
      const selectedIds = Object.keys(rowSelection).map(
        (index) => jobs[parseInt(index)]?.id
      );
      onSelectionChange(selectedIds.filter(Boolean));
    }
  }, [rowSelection, jobs, onSelectionChange]);

  return (
    <div className='w-full'>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='cursor-pointer'
                  onClick={() =>
                    router.push(`/dashboard/jobs/${row.original.id}`)
                  }
                >
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
                  No jobs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-end space-x-2 py-4'>
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
  );
}
