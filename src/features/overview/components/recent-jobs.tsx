'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { JobStatus } from '@/types/job';

interface RecentJob {
  id: string;
  clientName: string;
  supplierName: string;
  status: JobStatus;
  totalAmount: number;
  createdAt: string;
}

const statusColors: Record<JobStatus, string> = {
  IN_POOL: 'bg-orange-500/10 text-orange-600',
  ASSIGNED: 'bg-blue-500/10 text-blue-600',
  STARTED: 'bg-yellow-500/10 text-yellow-600',
  PICKED: 'bg-orange-500/10 text-orange-600',
  COMPLETED: 'bg-green-500/10 text-green-600',
  CANCELLED: 'bg-red-500/10 text-red-600',
  FAILED: 'bg-red-700/10 text-red-700'
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

export function RecentJobs() {
  const [jobs, setJobs] = useState<RecentJob[]>([]);
  const [monthCount, setMonthCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/dashboard/recent-jobs');
        if (res.ok) {
          const data = await res.json();
          setJobs(data.jobs || []);
          setMonthCount(data.monthCount || 0);
        }
      } catch (error) {
        console.error('Failed to fetch recent jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Jobs</CardTitle>
        <CardDescription>
          You created {monthCount} jobs this month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {jobs.length === 0 ? (
            <p className='text-muted-foreground py-4 text-center text-sm'>
              No recent jobs found.
            </p>
          ) : (
            jobs.map((job) => (
              <Link
                key={job.id}
                href={`/dashboard/jobs/${job.id}`}
                className='hover:bg-accent flex items-start justify-between gap-4 rounded-lg p-3 transition-colors'
              >
                <div className='flex-1 space-y-1'>
                  <div className='flex items-center gap-2'>
                    <p className='text-sm leading-none font-medium'>
                      {job.clientName}
                    </p>
                    <Badge
                      variant='outline'
                      className={statusColors[job.status]}
                    >
                      {statusLabels[job.status]}
                    </Badge>
                  </div>
                  <p className='text-muted-foreground text-xs'>
                    {job.supplierName}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-sm font-semibold'>
                    ${job.totalAmount.toFixed(2)}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
