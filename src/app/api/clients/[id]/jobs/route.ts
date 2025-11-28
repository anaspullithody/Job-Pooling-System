import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminOrAccountant } from '@/lib/auth/clerk';

// GET /api/clients/[id]/jobs - List all jobs for a client
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrAccountant();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {
      clientId: id,
      deletedAt: null
    };

    const status = searchParams.get('status');
    if (status) {
      where.status = status;
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          supplier: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.job.count({ where })
    ]);

    // Serialize Decimal fields
    const serializedJobs = jobs.map((job) => ({
      ...job,
      price: job.price ? Number(job.price) : 0,
      taxAmount: job.taxAmount ? Number(job.taxAmount) : 0,
      totalAmount: job.totalAmount ? Number(job.totalAmount) : 0
    }));

    return NextResponse.json({ jobs: serializedJobs, total, page, limit });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error fetching client jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}
