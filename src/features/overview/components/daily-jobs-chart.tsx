'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { format } from 'date-fns';
import { BarChart } from '@/features/overview/components/bar-chart';

interface DailyStat {
  date: string;
  count: number;
}

export function DailyJobsChart() {
  const [data, setData] = useState<any[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [averagePerDay, setAveragePerDay] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard/job-stats/daily');
        if (res.ok) {
          const result = await res.json();

          // Format data for chart
          const formattedData = result.dailyStats.map((stat: DailyStat) => ({
            date: format(new Date(stat.date), 'MMM dd'),
            Jobs: stat.count
          }));

          setData(formattedData);
          setTotalJobs(result.totalJobs);
          setAveragePerDay(result.averagePerDay);
        }
      } catch (error) {
        console.error('Failed to fetch daily job stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Job Activity</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>Daily Job Activity</CardTitle>
            <CardDescription>
              Job creation trend for the last 30 days
            </CardDescription>
          </div>
          <div className='flex gap-8'>
            <div className='text-right'>
              <p className='text-muted-foreground text-sm'>Total Jobs</p>
              <p className='text-2xl font-bold'>{totalJobs}</p>
            </div>
            <div className='text-right'>
              <p className='text-muted-foreground text-sm'>Avg per Day</p>
              <p className='text-2xl font-bold'>{averagePerDay}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <BarChart data={data} />
      </CardContent>
    </Card>
  );
}
