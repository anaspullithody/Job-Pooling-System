import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireSuperAdmin } from '@/lib/auth/clerk';
import { bulkJobActionSchema } from '@/features/jobs/schemas/job';
import { z } from 'zod';

// POST /api/jobs/bulk - Bulk operations
export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin();

    const body = await request.json();
    const { jobIds, action, status } = bulkJobActionSchema.parse(body);

    if (action === 'delete') {
      // Soft delete
      await prisma.job.updateMany({
        where: {
          id: { in: jobIds }
        },
        data: {
          deletedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: `${jobIds.length} job(s) deleted`
      });
    }

    if (action === 'status_change' && status) {
      await prisma.job.updateMany({
        where: {
          id: { in: jobIds }
        },
        data: {
          status
        }
      });

      // Create job logs for status changes
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
          await prisma.jobLog.createMany({
            data: jobIds.map((jobId) => ({
              jobId,
              actorId: user.id,
              action: 'STATUS_CHANGED',
              notes: `Bulk status change to ${status}`
            }))
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: `${jobIds.length} job(s) status updated to ${status}`
      });
    }

    return NextResponse.json(
      { error: 'Invalid action or missing status' },
      { status: 400 }
    );
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
    console.error('Error in bulk operation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
