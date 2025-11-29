'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ReportTable } from './report-table';
import { ReportType, type ReportDataResponse } from '@/types/report';
import { toast } from 'sonner';

export function ReportsView() {
  const [dateFrom, setDateFrom] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reportType, setReportType] = useState<ReportType | ''>('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [reportData, setReportData] = useState<ReportDataResponse | null>(null);

  const handleViewReport = async () => {
    if (!reportType) {
      toast.error('Please select a report type');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        dateFrom,
        dateTo,
        type: reportType
      });

      const response = await fetch(`/api/reports/data?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }

      const data: ReportDataResponse = await response.json();
      setReportData(data);
      toast.success('Report loaded successfully');
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    if (!reportType) {
      toast.error('Please select a report type');
      return;
    }

    setExporting(true);
    try {
      const params = new URLSearchParams({
        dateFrom,
        dateTo,
        type: reportType,
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
      a.download = `${reportType}-report-${dateFrom}-to-${dateTo}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Date Range */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <Label htmlFor='dateFrom'>From Date</Label>
              <Input
                id='dateFrom'
                type='date'
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setReportData(null); // Clear report on filter change
                }}
              />
            </div>
            <div>
              <Label htmlFor='dateTo'>To Date</Label>
              <Input
                id='dateTo'
                type='date'
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setReportData(null); // Clear report on filter change
                }}
              />
            </div>
          </div>

          {/* Report Type Selection */}
          <div>
            <Label htmlFor='reportType'>Report Type</Label>
            <Select
              value={reportType}
              onValueChange={(value) => {
                setReportType(value as ReportType);
                setReportData(null); // Clear report on type change
              }}
            >
              <SelectTrigger id='reportType'>
                <SelectValue placeholder='Select report type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ReportType.SUPPLIER}>
                  Supplier-wise Report
                </SelectItem>
                <SelectItem value={ReportType.CLIENT}>
                  Client-wise Report
                </SelectItem>
                <SelectItem value={ReportType.DAILY}>Daily Summary</SelectItem>
              </SelectContent>
            </Select>
            <p className='text-muted-foreground mt-1 text-sm'>
              {reportType === ReportType.SUPPLIER && 'Jobs grouped by supplier'}
              {reportType === ReportType.CLIENT && 'Jobs grouped by client'}
              {reportType === ReportType.DAILY && 'Daily summary of all jobs'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-wrap gap-2'>
            <Button
              onClick={handleViewReport}
              disabled={loading || !reportType}
              className='flex-1 md:flex-none'
            >
              {loading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Loading...
                </>
              ) : (
                <>
                  <Eye className='mr-2 h-4 w-4' />
                  View Report
                </>
              )}
            </Button>
            <Button
              onClick={() => handleExport('excel')}
              disabled={exporting || !reportType}
              variant='outline'
              className='flex-1 md:flex-none'
            >
              {exporting ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <>
                  <Download className='mr-2 h-4 w-4' />
                  Export Excel
                </>
              )}
            </Button>
            <Button
              onClick={() => handleExport('pdf')}
              disabled={exporting || !reportType}
              variant='outline'
              className='flex-1 md:flex-none'
            >
              {exporting ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <>
                  <Download className='mr-2 h-4 w-4' />
                  Export PDF
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Table */}
      {reportData && (
        <div>
          <h3 className='mb-4 text-lg font-semibold'>
            {reportType === ReportType.SUPPLIER && 'Supplier-wise Report'}
            {reportType === ReportType.CLIENT && 'Client-wise Report'}
            {reportType === ReportType.DAILY && 'Daily Summary'}
            {' - '}
            {format(new Date(dateFrom), 'MMM dd, yyyy')} to{' '}
            {format(new Date(dateTo), 'MMM dd, yyyy')}
          </h3>
          <ReportTable
            data={reportData.data as any}
            type={reportData.type}
            totalAmount={reportData.totalAmount}
          />
        </div>
      )}
    </div>
  );
}
