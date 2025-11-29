import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminOrAccountant } from '@/lib/auth/clerk';

export async function GET() {
  try {
    await requireAdminOrAccountant();

    // Get last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const jobs = await prisma.job.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        deletedAt: null
      },
      select: {
        createdAt: true
      }
    });

    // Group by date
    const dailyCounts: { [key: string]: number } = {};

    // Initialize all 30 days with 0
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyCounts[dateKey] = 0;
    }

    // Count jobs per day
    jobs.forEach((job) => {
      const dateKey = job.createdAt.toISOString().split('T')[0];
      if (dailyCounts[dateKey] !== undefined) {
        dailyCounts[dateKey]++;
      }
    });

    // Convert to array and sort by date
    const dailyStats = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate totals
    const totalJobs = jobs.length;
    const averagePerDay = totalJobs / 30;

    return NextResponse.json({
      dailyStats,
      totalJobs,
      averagePerDay: Math.round(averagePerDay * 10) / 10
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error fetching daily job stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily stats' },
      { status: 500 }
    );
  }
}
