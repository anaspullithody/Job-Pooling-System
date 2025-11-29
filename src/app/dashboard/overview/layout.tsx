import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import React from 'react';

async function getDashboardStats() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/dashboard/stats`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error('Failed to fetch stats');
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
}

export default async function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  const stats = await getDashboardStats();

  const todayCount = stats?.todayJobs?.count || 0;
  const todayTrend = stats?.todayJobs?.trend || 0;
  const assignedCount = stats?.assignedJobs?.count || 0;
  const poolCount = stats?.jobsInPool?.count || 0;
  const completedCount = stats?.completedToday?.count || 0;
  const completedRate = stats?.completedToday?.percentage || 0;

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Hi, Welcome back 👋
          </h2>
        </div>

        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
          {/* Today's Jobs */}
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Today&apos;s Jobs</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {todayCount}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  {todayTrend >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
                  {todayTrend >= 0 ? '+' : ''}
                  {todayTrend.toFixed(1)}%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                {todayTrend >= 0 ? 'Trending up' : 'Trending down'}{' '}
                {todayTrend >= 0 ? (
                  <IconTrendingUp className='size-4' />
                ) : (
                  <IconTrendingDown className='size-4' />
                )}
              </div>
              <div className='text-muted-foreground'>Compared to yesterday</div>
            </CardFooter>
          </Card>

          {/* Assigned Jobs */}
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Assigned Jobs</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {assignedCount}
              </CardTitle>
              <CardAction>
                <Badge variant='outline' className='bg-blue-500/10'>
                  Active
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Currently assigned to drivers
              </div>
              <div className='text-muted-foreground'>Jobs in progress</div>
            </CardFooter>
          </Card>

          {/* Yet to Assign (Jobs in Pool) */}
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Yet to Assign</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {poolCount}
              </CardTitle>
              <CardAction>
                <Badge
                  variant='outline'
                  className={
                    poolCount > 0
                      ? 'bg-orange-500/10 text-orange-600'
                      : 'bg-green-500/10 text-green-600'
                  }
                >
                  {poolCount > 0 ? 'Needs attention' : 'All assigned'}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Jobs in pool
              </div>
              <div className='text-muted-foreground'>
                Waiting for driver assignment
              </div>
            </CardFooter>
          </Card>

          {/* Completed Today */}
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Completed Today</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {completedCount}
              </CardTitle>
              <CardAction>
                <Badge variant='outline' className='bg-green-500/10'>
                  <IconTrendingUp />
                  {completedRate.toFixed(0)}%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Completion rate <IconTrendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                {completedRate.toFixed(0)}% of today&apos;s jobs done
              </div>
            </CardFooter>
          </Card>
        </div>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
          {/* Daily Jobs Chart - 4 columns on large screens */}
          <div className='col-span-1 lg:col-span-4'>{bar_stats}</div>

          {/* Recent Jobs - 3 columns on large screens */}
          <div className='col-span-1 lg:col-span-3'>{sales}</div>

          {/* Active Jobs Table - Full width */}
          <div className='col-span-1 lg:col-span-7'>{area_stats}</div>
        </div>
      </div>
    </PageContainer>
  );
}
