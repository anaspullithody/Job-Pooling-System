import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyDriverToken } from '@/lib/auth/driver';
import { cookies } from 'next/headers';
import { JobStatus } from '@/types/job';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.nativeEnum(JobStatus)
});

// PATCH /api/driver/jobs/[id]/status - Update job status (driver)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('driver_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyDriverToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = updateStatusSchema.parse(body);

    // Verify job belongs to this driver
    const job = await prisma.job.findFirst({
      where: {
        id,
        deletedAt: null
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Verify status transition is valid
    const validTransitions: Partial<Record<JobStatus, JobStatus[]>> = {
      [JobStatus.IN_POOL]: [],
      [JobStatus.ASSIGNED]: [JobStatus.STARTED],
      [JobStatus.STARTED]: [JobStatus.PICKED],
      [JobStatus.PICKED]: [JobStatus.COMPLETED],
      [JobStatus.COMPLETED]: [],
      [JobStatus.CANCELLED]: [],
      [JobStatus.FAILED]: []
    };

    if (!validTransitions[job.status as JobStatus]?.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status transition' },
        { status: 400 }
      );
    }

    // Update job status
    const updatedJob = await prisma.job.update({
      where: { id },
      data: { status }
    });

    // Create job log
    await prisma.jobLog.create({
      data: {
        jobId: id,
        actorId: payload.userId,
        action: 'STATUS_CHANGED',
        notes: `Status changed from ${job.status} to ${status} by driver`
      }
    });

    return NextResponse.json({ job: updatedJob });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating job status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
