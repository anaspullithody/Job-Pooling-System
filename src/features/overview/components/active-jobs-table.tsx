'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Pencil, Search } from 'lucide-react';
import Link from 'next/link';
import { JobStatus } from '@/types/job';

interface ActiveJob {
  id: string;
  guestName: string;
  clientName: string;
  supplierName: string;
  status: JobStatus;
  totalAmount: number;
}

const statusColors: Record<string, string> = {
  IN_POOL: 'bg-orange-500/10 text-orange-600',
  ASSIGNED: 'bg-blue-500/10 text-blue-600'
};

const statusLabels: Record<string, string> = {
  IN_POOL: 'In Pool',
  ASSIGNED: 'Assigned'
};

export function ActiveJobsTable() {
  const [jobs, setJobs] = useState<ActiveJob[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchJobs = async (currentPage: number, searchTerm: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm })
      });

      const res = await fetch(`/api/dashboard/active-jobs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch active jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs(page, search);
    }, 300);

    return () => clearTimeout(timer);
  }, [page, search]);

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>Active Jobs</CardTitle>
            <CardDescription>
              Jobs requiring attention ({total} total)
            </CardDescription>
          </div>
          <div className='relative w-64'>
            <Search className='text-muted-foreground absolute top-2.5 left-2 h-4 w-4' />
            <Input
              placeholder='Search jobs...'
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className='pl-8'
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Guest Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-right'>Amount</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-24 text-center'>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-24 text-center'>
                    No active jobs found.
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className='font-medium'>
                      {job.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>{job.guestName}</TableCell>
                    <TableCell>{job.clientName}</TableCell>
                    <TableCell>{job.supplierName}</TableCell>
                    <TableCell>
                      <Badge
                        variant='outline'
                        className={statusColors[job.status]}
                      >
                        {statusLabels[job.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right'>
                      ${job.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
                        <Link href={`/dashboard/jobs/${job.id}`}>
                          <Button variant='ghost' size='sm'>
                            <Eye className='h-4 w-4' />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/jobs/${job.id}/edit`}>
                          <Button variant='ghost' size='sm'>
                            <Pencil className='h-4 w-4' />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className='flex items-center justify-between pt-4'>
            <p className='text-muted-foreground text-sm'>
              Page {page} of {totalPages}
            </p>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
