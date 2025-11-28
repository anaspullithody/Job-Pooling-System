import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireSuperAdmin } from '@/lib/auth/clerk';
import { updateDriverSchema } from '@/features/drivers/schemas/driver';
import { z } from 'zod';

// GET /api/drivers/[id] - Get driver by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;

    const driver = await prisma.user.findFirst({
      where: {
        id,
        role: 'DRIVER'
      },
      select: {
        id: true,
        phone: true,
        pinTemp: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    return NextResponse.json({ driver });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error fetching driver:', error);
    return NextResponse.json(
      { error: 'Failed to fetch driver' },
      { status: 500 }
    );
  }
}

// PATCH /api/drivers/[id] - Update driver
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;

    const body = await req.json();
    const validatedData = updateDriverSchema.parse(body);

    if (validatedData.phone) {
      // Check if phone is already taken by another driver
      const existingDriver = await prisma.user.findFirst({
        where: {
          phone: validatedData.phone,
          NOT: { id }
        }
      });

      if (existingDriver) {
        return NextResponse.json(
          { error: 'Phone number already in use' },
          { status: 400 }
        );
      }
    }

    const driver = await prisma.user.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        phone: true,
        pinTemp: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ driver });
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
    console.error('Error updating driver:', error);
    return NextResponse.json(
      { error: 'Failed to update driver' },
      { status: 500 }
    );
  }
}

// DELETE /api/drivers/[id] - Delete driver
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error deleting driver:', error);
    return NextResponse.json(
      { error: 'Failed to delete driver' },
      { status: 500 }
    );
  }
}
