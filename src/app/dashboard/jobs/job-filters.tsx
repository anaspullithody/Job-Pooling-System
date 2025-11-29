'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { JobStatus } from '@/types/job';
import { useState } from 'react';
import { TableSearch } from '@/components/ui/table-search';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const statusOptions: { value: JobStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: JobStatus.IN_POOL, label: 'In Pool' },
  { value: JobStatus.ASSIGNED, label: 'Assigned' },
  { value: JobStatus.STARTED, label: 'Started' },
  { value: JobStatus.PICKED, label: 'Picked' },
  { value: JobStatus.COMPLETED, label: 'Completed' },
  { value: JobStatus.CANCELLED, label: 'Cancelled' },
  { value: JobStatus.FAILED, label: 'Failed' }
];

interface Company {
  id: string;
  name: string;
}

interface JobFiltersProps {
  clients: Company[];
  suppliers: Company[];
}

export function JobFilters({ clients, suppliers }: JobFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState<JobStatus | 'all'>(
    (searchParams.get('status') as JobStatus) || 'all'
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    searchParams.get('date') ? new Date(searchParams.get('date')!) : undefined
  );
  const [clientId, setClientId] = useState<string>(
    searchParams.get('clientId') || 'all'
  );
  const [supplierId, setSupplierId] = useState<string>(
    searchParams.get('supplierId') || 'all'
  );

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/dashboard/jobs?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    updateFilters('search', value);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      updateFilters('date', format(date, 'yyyy-MM-dd'));
    } else {
      updateFilters('date', '');
    }
  };

  const clearAllFilters = () => {
    setSearch('');
    setStatus('all');
    setSelectedDate(undefined);
    setClientId('all');
    setSupplierId('all');
    router.push('/dashboard/jobs');
  };

  return (
    <div className='rounded-lg border p-4'>
      <div className='flex items-end gap-3'>
        {/* Date Picker */}
        <div className='w-[180px]'>
          <Label className='mb-2 block text-sm'>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !selectedDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0'>
              <Calendar
                mode='single'
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Search */}
        <div className='w-[280px]'>
          <Label className='mb-2 block text-sm'>Search</Label>
          <TableSearch
            value={search}
            onChange={handleSearchChange}
            placeholder='Guest, contact, pickup, drop...'
          />
        </div>

        {/* Status */}
        <div className='w-[160px]'>
          <Label className='mb-2 block text-sm'>Status</Label>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as JobStatus | 'all');
              updateFilters('status', value);
            }}
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

        {/* Client */}
        <div className='w-[180px]'>
          <Label className='mb-2 block text-sm'>Client</Label>
          <Select
            value={clientId}
            onValueChange={(value) => {
              setClientId(value);
              updateFilters('clientId', value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder='All Clients' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Clients</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Supplier */}
        <div className='w-[180px]'>
          <Label className='mb-2 block text-sm'>Supplier</Label>
          <Select
            value={supplierId}
            onValueChange={(value) => {
              setSupplierId(value);
              updateFilters('supplierId', value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder='All Suppliers' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Suppliers</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Button */}
        <Button type='button' variant='outline' onClick={clearAllFilters}>
          Clear
        </Button>
      </div>
    </div>
  );
}
