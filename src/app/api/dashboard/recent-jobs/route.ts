import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminOrAccountant } from '@/lib/auth/clerk';

export async function GET() {
  try {
    await requireAdminOrAccountant();

    const recentJobs = await prisma.job.findMany({
      where: {
        deletedAt: null
      },
      select: {
        id: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        client: {
          select: {
            name: true
          }
        },
        supplier: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 6
    });

    // Count jobs this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthCount = await prisma.job.count({
      where: {
        createdAt: { gte: startOfMonth },
        deletedAt: null
      }
    });

    // Serialize decimal values
    const serializedJobs = recentJobs.map((job) => ({
      ...job,
      totalAmount: job.totalAmount ? Number(job.totalAmount) : 0,
      clientName: job.client.name,
      supplierName: job.supplier?.name || 'N/A'
    }));

    return NextResponse.json({
      jobs: serializedJobs,
      monthCount
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error fetching recent jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent jobs' },
      { status: 500 }
    );
  }
}
