'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, KeyRound } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Driver {
  id: string;
  phone: string;
  pinTemp: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DriverListProps {
  drivers: Driver[];
  onEdit: (driver: Driver) => void;
  onDelete: (driverId: string) => void;
  onResetPin: (driver: Driver) => void;
}

export function DriverList({
  drivers,
  onEdit,
  onDelete,
  onResetPin
}: DriverListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (driverId: string) => {
    if (!confirm('Are you sure you want to delete this driver?')) {
      return;
    }

    setDeleting(driverId);
    try {
      const res = await fetch(`/api/drivers/${driverId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete driver');
      }

      toast.success('Driver deleted successfully');
      onDelete(driverId);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete driver');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Phone</TableHead>
            <TableHead>PIN Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className='text-muted-foreground text-center'
              >
                No drivers found
              </TableCell>
            </TableRow>
          ) : (
            drivers.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell className='font-medium'>{driver.phone}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      driver.pinTemp
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {driver.pinTemp ? 'Temporary' : 'Permanent'}
                  </span>
                </TableCell>
                <TableCell>
                  {format(new Date(driver.createdAt), 'MMM d, yyyy HH:mm')}
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex justify-end gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onEdit(driver)}
                      title='Edit driver'
                    >
                      <Pencil className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onResetPin(driver)}
                      title='Reset PIN'
                    >
                      <KeyRound className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDelete(driver.id)}
                      disabled={deleting === driver.id}
                      title='Delete driver'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
