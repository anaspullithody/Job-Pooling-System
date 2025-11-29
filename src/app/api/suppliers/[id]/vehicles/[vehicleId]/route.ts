import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminOrAccountant } from '@/lib/auth/clerk';
import { z } from 'zod';

const updateVehicleSchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  regNumber: z.string().optional()
});

// PATCH /api/suppliers/[id]/vehicles/[vehicleId] - Update vehicle
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; vehicleId: string }> }
) {
  try {
    await requireAdminOrAccountant();
    const { vehicleId } = await params;

    const body = await req.json();
    const validatedData = updateVehicleSchema.parse(body);

    const vehicle = await prisma.supplierVehicle.update({
      where: { id: vehicleId },
      data: validatedData
    });

    return NextResponse.json({ vehicle });
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
    console.error('Error updating vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to update vehicle' },
      { status: 500 }
    );
  }
}

// DELETE /api/suppliers/[id]/vehicles/[vehicleId] - Delete vehicle
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; vehicleId: string }> }
) {
  try {
    await requireAdminOrAccountant();
    const { vehicleId } = await params;

    await prisma.supplierVehicle.delete({
      where: { id: vehicleId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error deleting vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to delete vehicle' },
      { status: 500 }
    );
  }
}
