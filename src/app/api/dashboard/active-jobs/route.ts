import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminOrAccountant } from '@/lib/auth/clerk';

export async function GET(req: NextRequest) {
  try {
    await requireAdminOrAccountant();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: { in: ['IN_POOL', 'ASSIGNED'] },
      deletedAt: null
    };

    if (search) {
      where.OR = [
        { guestName: { contains: search, mode: 'insensitive' } },
        { guestContact: { contains: search, mode: 'insensitive' } },
        { pickup: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        select: {
          id: true,
          guestName: true,
          status: true,
          totalAmount: true,
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
        skip,
        take: limit
      }),
      prisma.job.count({ where })
    ]);

    // Serialize decimal values
    const serializedJobs = jobs.map((job) => ({
      ...job,
      totalAmount: job.totalAmount ? Number(job.totalAmount) : 0,
      clientName: job.client.name,
      supplierName: job.supplier?.name || 'N/A'
    }));

    return NextResponse.json({
      jobs: serializedJobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error fetching active jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active jobs' },
      { status: 500 }
    );
  }
}
