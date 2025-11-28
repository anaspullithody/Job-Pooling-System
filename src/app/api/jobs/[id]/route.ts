import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminOrAccountant, requireSuperAdmin } from '@/lib/auth/clerk';
import { updateJobSchema } from '@/features/jobs/schemas/job';
import { z } from 'zod';

// GET /api/jobs/[id] - Get single job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrAccountant();

    const { id } = await params;

    const job = await prisma.job.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: {
        client: {
          include: {
            contacts: true
          }
        },
        supplier: {
          include: {
            contacts: true,
            supplierCategories: true,
            supplierVehicles: true
          }
        },
        jobLogs: {
          include: {
            actor: {
              select: {
                id: true,
                email: true,
                phone: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        invoice: true
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/jobs/[id] - Update job
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();

    const { id } = await params;
    const body = await request.json();
    const data = updateJobSchema.parse(body);

    const existingJob = await prisma.job.findFirst({
      where: {
        id,
        deletedAt: null
      }
    });

    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const job = await prisma.job.update({
      where: { id },
      data: {
        ...data,
        price: data.price !== undefined ? data.price : undefined,
        taxAmount: data.taxAmount !== undefined ? data.taxAmount : undefined,
        totalAmount:
          data.totalAmount !== undefined ? data.totalAmount : undefined
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

    // Create job log for status change
    if (data.status && data.status !== existingJob.status) {
      const { userId } = await import('@clerk/nextjs/server').then((m) =>
        m.auth()
      );
      if (userId) {
        const user = await prisma.user.findFirst({
          where: {
            // Find user by Clerk ID - adjust as needed
          }
        });

        if (user) {
          await prisma.jobLog.create({
            data: {
              jobId: job.id,
              actorId: user.id,
              action: 'STATUS_CHANGED',
              notes: `Status changed from ${existingJob.status} to ${data.status}`
            }
          });
        }
      }
    }

    return NextResponse.json(job);
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
    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id] - Soft delete job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();

    const { id } = await params;

    const job = await prisma.job.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
