import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireSuperAdmin } from '@/lib/auth/clerk';
import { z } from 'zod';

const updateModelSchema = z.object({
  name: z.string().min(1).optional(),
  brandName: z.string().min(1).optional(),
  category: z.string().optional(),
  isPopular: z.boolean().optional(),
  sortOrder: z.number().int().optional()
});

// PATCH /api/vehicle-models/[id] - Update model
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;

    const body = await req.json();
    const validatedData = updateModelSchema.parse(body);

    const model = await prisma.vehicleModel.update({
      where: { id },
      data: validatedData
    });

    return NextResponse.json({ model });
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
    console.error('Error updating model:', error);
    return NextResponse.json(
      { error: 'Failed to update model' },
      { status: 500 }
    );
  }
}

// DELETE /api/vehicle-models/[id] - Delete model
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;

    const model = await prisma.vehicleModel.findUnique({
      where: { id }
    });

    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    await prisma.vehicleModel.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error deleting model:', error);
    return NextResponse.json(
      { error: 'Failed to delete model' },
      { status: 500 }
    );
  }
}
