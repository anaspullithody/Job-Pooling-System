import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminOrAccountant } from '@/lib/auth/clerk';

export async function GET() {
  try {
    await requireAdminOrAccountant();

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get yesterday's date range for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Fetch all metrics in parallel
    const [
      todayJobs,
      yesterdayJobs,
      assignedJobs,
      jobsInPool,
      completedToday,
      completedYesterday
    ] = await Promise.all([
      // Today's jobs
      prisma.job.count({
        where: {
          createdAt: { gte: today, lt: tomorrow },
          deletedAt: null
        }
      }),
      // Yesterday's jobs (for trend)
      prisma.job.count({
        where: {
          createdAt: { gte: yesterday, lt: today },
          deletedAt: null
        }
      }),
      // Assigned jobs
      prisma.job.count({
        where: {
          status: 'ASSIGNED',
          deletedAt: null
        }
      }),
      // Jobs in pool (yet to assign)
      prisma.job.count({
        where: {
          status: 'IN_POOL',
          deletedAt: null
        }
      }),
      // Completed today
      prisma.job.count({
        where: {
          status: 'COMPLETED',
          updatedAt: { gte: today, lt: tomorrow },
          deletedAt: null
        }
      }),
      // Completed yesterday (for trend)
      prisma.job.count({
        where: {
          status: 'COMPLETED',
          updatedAt: { gte: yesterday, lt: today },
          deletedAt: null
        }
      })
    ]);

    // Calculate trends
    const todayJobsTrend =
      yesterdayJobs > 0
        ? ((todayJobs - yesterdayJobs) / yesterdayJobs) * 100
        : todayJobs > 0
          ? 100
          : 0;

    const completedTodayTrend =
      completedYesterday > 0
        ? ((completedToday - completedYesterday) / completedYesterday) * 100
        : completedToday > 0
          ? 100
          : 0;

    // Calculate completion percentage of today's jobs
    const completionRate =
      todayJobs > 0 ? (completedToday / todayJobs) * 100 : 0;

    return NextResponse.json({
      todayJobs: {
        count: todayJobs,
        trend: todayJobsTrend,
        comparison: yesterdayJobs
      },
      assignedJobs: {
        count: assignedJobs
      },
      jobsInPool: {
        count: jobsInPool
      },
      completedToday: {
        count: completedToday,
        trend: completedTodayTrend,
        percentage: completionRate
      }
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
