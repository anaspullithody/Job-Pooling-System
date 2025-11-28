'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { JobStatus } from '@/types/job';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Copy, Edit, Trash2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface JobDetailViewProps {
  job: any;
  canEdit: boolean;
}

export function JobDetailView({ job, canEdit }: JobDetailViewProps) {
  const router = useRouter();
  const [status, setStatus] = useState<JobStatus>(job.status);
  const [failureReason, setFailureReason] = useState(job.failureReason || '');
  const [loading, setLoading] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleStatusChange = async (newStatus: JobStatus) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          failureReason: newStatus === 'FAILED' ? failureReason : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setStatus(newStatus);
      router.refresh();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete job');
      }

      router.push('/dashboard/jobs');
      router.refresh();
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job');
    } finally {
      setLoading(false);
    }
  };

  const handleGetWhatsAppMessage = async () => {
    try {
      const response = await fetch(`/api/jobs/${job.id}/whatsapp-message`);
      const data = await response.json();
      setWhatsappMessage(data.message);
    } catch (error) {
      console.error('Error fetching WhatsApp message:', error);
    }
  };

  const handleCopyMessage = () => {
    if (whatsappMessage) {
      navigator.clipboard.writeText(whatsappMessage);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-3xl font-bold tracking-tight'>Job Details</h2>
        <div className='flex gap-2'>
          {canEdit && (
            <>
              <Button
                variant='outline'
                onClick={() => router.push(`/dashboard/jobs/${job.id}/edit`)}
                disabled={loading}
              >
                <Edit className='mr-2 h-4 w-4' />
                Edit
              </Button>
              <Button
                variant='destructive'
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Delete
              </Button>
            </>
          )}
          <Button
            variant='outline'
            onClick={handleGetWhatsAppMessage}
            disabled={loading}
          >
            <Copy className='mr-2 h-4 w-4' />
            Copy WhatsApp Message
          </Button>
        </div>
      </div>

      {whatsappMessage && (
        <Alert>
          <AlertDescription className='space-y-2'>
            <div className='text-sm whitespace-pre-wrap'>{whatsappMessage}</div>
            <Button size='sm' onClick={handleCopyMessage} className='mt-2'>
              {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Job Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label className='text-muted-foreground'>Status</Label>
              <div className='mt-1'>
                {canEdit ? (
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      handleStatusChange(value as JobStatus)
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={statusColors[status]}>
                    {statusLabels[status]}
                  </Badge>
                )}
              </div>
            </div>

            {status === 'FAILED' && canEdit && (
              <div>
                <Label htmlFor='failureReason'>Failure Reason *</Label>
                <Textarea
                  id='failureReason'
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  placeholder='Enter reason for failure'
                  className='mt-1'
                />
                <Button
                  size='sm'
                  onClick={() => handleStatusChange('FAILED')}
                  className='mt-2'
                  disabled={!failureReason || loading}
                >
                  Save Reason
                </Button>
              </div>
            )}

            <div>
              <Label className='text-muted-foreground'>Guest Name</Label>
              <p className='font-medium'>{job.guestName}</p>
            </div>

            <div>
              <Label className='text-muted-foreground'>Guest Contact</Label>
              <p className='font-medium'>{job.guestContact}</p>
            </div>

            <div>
              <Label className='text-muted-foreground'>Pickup</Label>
              <p className='font-medium'>{job.pickup}</p>
            </div>

            <div>
              <Label className='text-muted-foreground'>Drop</Label>
              <p className='font-medium'>{job.drop}</p>
            </div>

            {job.flight && (
              <div>
                <Label className='text-muted-foreground'>Flight</Label>
                <p className='font-medium'>{job.flight}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label className='text-muted-foreground'>Client</Label>
              <p className='font-medium'>{job.client?.name}</p>
            </div>

            {job.supplier && (
              <div>
                <Label className='text-muted-foreground'>Supplier</Label>
                <p className='font-medium'>{job.supplier.name}</p>
              </div>
            )}

            {job.category && (
              <div>
                <Label className='text-muted-foreground'>Category</Label>
                <p className='font-medium'>{job.category}</p>
              </div>
            )}

            {job.vehicle && (
              <div>
                <Label className='text-muted-foreground'>Vehicle</Label>
                <p className='font-medium'>{job.vehicle}</p>
              </div>
            )}

            {job.driverName && (
              <div>
                <Label className='text-muted-foreground'>Driver</Label>
                <p className='font-medium'>{job.driverName}</p>
              </div>
            )}

            {job.assignedPlate && (
              <div>
                <Label className='text-muted-foreground'>Plate Number</Label>
                <p className='font-medium'>{job.assignedPlate}</p>
              </div>
            )}

            {job.price && (
              <div>
                <Label className='text-muted-foreground'>Price</Label>
                <p className='font-medium'>AED {job.price}</p>
              </div>
            )}

            {job.taxAmount && (
              <div>
                <Label className='text-muted-foreground'>Tax</Label>
                <p className='font-medium'>AED {job.taxAmount}</p>
              </div>
            )}

            {job.totalAmount && (
              <div>
                <Label className='text-muted-foreground'>Total</Label>
                <p className='font-medium'>AED {job.totalAmount}</p>
              </div>
            )}

            <div>
              <Label className='text-muted-foreground'>Created</Label>
              <p className='font-medium'>
                {format(
                  formatInTimeZone(
                    new Date(job.createdAt),
                    'Asia/Dubai',
                    'yyyy-MM-dd HH:mm'
                  ),
                  'MMM dd, yyyy HH:mm'
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {job.jobLogs && job.jobLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Job History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {job.jobLogs.map((log: any) => (
                <div key={log.id} className='border-l-2 pl-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>{log.action}</p>
                      {log.notes && (
                        <p className='text-muted-foreground text-sm'>
                          {log.notes}
                        </p>
                      )}
                    </div>
                    <div className='text-right'>
                      {log.actor && (
                        <p className='text-muted-foreground text-sm'>
                          {log.actor.email || log.actor.phone}
                        </p>
                      )}
                      <p className='text-muted-foreground text-xs'>
                        {format(
                          formatInTimeZone(
                            new Date(log.createdAt),
                            'Asia/Dubai',
                            'yyyy-MM-dd HH:mm'
                          ),
                          'MMM dd, yyyy HH:mm'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
