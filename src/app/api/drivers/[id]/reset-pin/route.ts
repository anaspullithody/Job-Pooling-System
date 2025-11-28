import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireSuperAdmin } from '@/lib/auth/clerk';
import { resetPinSchema } from '@/features/drivers/schemas/driver';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// POST /api/drivers/[id]/reset-pin - Reset driver PIN (Admin action)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;

    const body = await req.json();
    const validatedData = resetPinSchema.parse(body);

    // Check if driver exists
    const driver = await prisma.user.findFirst({
      where: {
        id,
        role: 'DRIVER'
      }
    });

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Hash new PIN
    const pinHash = await bcrypt.hash(validatedData.pin, 10);

    // Update driver PIN and mark as temporary
    await prisma.user.update({
      where: { id },
      data: {
        pinHash,
        pinTemp: true // Mark as temporary so driver must change it
      }
    });

    return NextResponse.json({
      success: true,
      message: 'PIN reset successfully'
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error resetting PIN:', error);
    return NextResponse.json({ error: 'Failed to reset PIN' }, { status: 500 });
  }
}
