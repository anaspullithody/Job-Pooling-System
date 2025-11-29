'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Download } from 'lucide-react';
import { format } from 'date-fns';

export function ReportsView() {
  const [dateFrom, setDateFrom] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);

  const handleExport = async (
    type: 'supplier' | 'client' | 'daily',
    format: 'excel' | 'pdf'
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        dateFrom,
        dateTo,
        type,
        format
      });

      const response = await fetch(`/api/reports/export?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report-${dateFrom}-to-${dateTo}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <Label htmlFor='dateFrom'>From Date</Label>
              <Input
                id='dateFrom'
                type='date'
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor='dateTo'>To Date</Label>
              <Input
                id='dateTo'
                type='date'
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>Supplier-wise Report</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <p className='text-muted-foreground text-sm'>
              Export all jobs grouped by supplier
            </p>
            <div className='flex gap-2'>
              <Button
                onClick={() => handleExport('supplier', 'excel')}
                disabled={loading}
                size='sm'
                className='flex-1'
              >
                {loading ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <>
                    <Download className='mr-2 h-4 w-4' />
                    Excel
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleExport('supplier', 'pdf')}
                disabled={loading}
                size='sm'
                variant='outline'
                className='flex-1'
              >
                {loading ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <>
                    <Download className='mr-2 h-4 w-4' />
                    PDF
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client-wise Report</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <p className='text-muted-foreground text-sm'>
              Export all jobs grouped by client
            </p>
            <div className='flex gap-2'>
              <Button
                onClick={() => handleExport('client', 'excel')}
                disabled={loading}
                size='sm'
                className='flex-1'
              >
                {loading ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <>
                    <Download className='mr-2 h-4 w-4' />
                    Excel
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleExport('client', 'pdf')}
                disabled={loading}
                size='sm'
                variant='outline'
                className='flex-1'
              >
                {loading ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <>
                    <Download className='mr-2 h-4 w-4' />
                    PDF
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Summary</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <p className='text-muted-foreground text-sm'>
              Export daily summary of all jobs
            </p>
            <div className='flex gap-2'>
              <Button
                onClick={() => handleExport('daily', 'excel')}
                disabled={loading}
                size='sm'
                className='flex-1'
              >
                {loading ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <>
                    <Download className='mr-2 h-4 w-4' />
                    Excel
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleExport('daily', 'pdf')}
                disabled={loading}
                size='sm'
                variant='outline'
                className='flex-1'
              >
                {loading ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <>
                    <Download className='mr-2 h-4 w-4' />
                    PDF
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
