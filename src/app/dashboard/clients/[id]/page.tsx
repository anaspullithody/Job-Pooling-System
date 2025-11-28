'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientRes, jobsRes] = await Promise.all([
          fetch(`/api/clients/${clientId}`),
          fetch(`/api/clients/${clientId}/jobs?limit=50`)
        ]);

        if (clientRes.ok) {
          const data = await clientRes.json();
          setClient(data.client);
        }
        if (jobsRes.ok) {
          const data = await jobsRes.json();
          setJobs(data.jobs);
        }
      } catch (error) {
        toast.error('Failed to load client details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  if (loading) {
    return <div className='flex-1 p-8'>Loading...</div>;
  }

  if (!client) {
    return <div className='flex-1 p-8'>Client not found</div>;
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      IN_POOL: 'bg-gray-100 text-gray-700',
      ASSIGNED: 'bg-blue-100 text-blue-700',
      STARTED: 'bg-yellow-100 text-yellow-700',
      PICKED: 'bg-purple-100 text-purple-700',
      COMPLETED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
      FAILED: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className='flex-1 space-y-4 p-4 pt-6 md:p-8'>
      <div className='flex items-center gap-4'>
        <Button variant='outline' size='sm' onClick={() => router.back()}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back
        </Button>
        <h2 className='text-3xl font-bold tracking-tight'>{client.name}</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div>
            <span className='font-semibold'>Name:</span> {client.name}
          </div>
          <div>
            <span className='font-semibold'>Phone:</span>{' '}
            {client.phone || 'N/A'}
          </div>
          <div>
            <span className='font-semibold'>Type:</span> {client.kind}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Pickup</TableHead>
                <TableHead>Drop</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className='text-muted-foreground text-center'
                  >
                    No jobs found
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => (
                  <TableRow
                    key={job.id}
                    className='hover:bg-muted/50 cursor-pointer'
                    onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                  >
                    <TableCell>{job.guestName}</TableCell>
                    <TableCell>{job.pickup}</TableCell>
                    <TableCell>{job.drop}</TableCell>
                    <TableCell>{job.supplier?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                          job.status
                        )}`}
                      >
                        {job.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>AED {job.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      {format(new Date(job.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
