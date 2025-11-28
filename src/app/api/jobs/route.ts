import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminOrAccountant } from '@/lib/auth/clerk';
import { createJobSchema } from '@/features/jobs/schemas/job';
import { JobStatus } from '@/types/job';
import { z } from 'zod';

// GET /api/jobs - List jobs with filters
export async function GET(request: NextRequest) {
  try {
    await requireAdminOrAccountant();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as JobStatus | null;
    const clientId = searchParams.get('clientId');
    const supplierId = searchParams.get('supplierId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null // Only non-deleted jobs
    };

    if (status) {
      where.status = status;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    if (search) {
      where.OR = [
        { guestName: { contains: search, mode: 'insensitive' } },
        { guestContact: { contains: search, mode: 'insensitive' } },
        { pickup: { contains: search, mode: 'insensitive' } },
        { drop: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true
            }
          },
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

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Create new job
export async function POST(request: NextRequest) {
  try {
    await requireAdminOrAccountant();

    const body = await request.json();
    const data = createJobSchema.parse(body);

    const job = await prisma.job.create({
      data: {
        ...data,
        status: JobStatus.IN_POOL,
        price: data.price ? data.price : null,
        taxAmount: data.taxAmount ? data.taxAmount : null,
        totalAmount: data.totalAmount ? data.totalAmount : null
      },
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        },
        supplier: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Create job log
    const { userId } = await import('@clerk/nextjs/server').then((m) =>
      m.auth()
    );
    if (userId) {
      const user = await prisma.user.findFirst({
        where: {
          // Find user by Clerk ID mapping - you may need to adjust this
          // For now, we'll use a placeholder
        }
      });

      if (user) {
        await prisma.jobLog.create({
          data: {
            jobId: job.id,
            actorId: user.id,
            action: 'CREATED',
            notes: 'Job created'
          }
        });
      }
    }

    return NextResponse.json(job, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
