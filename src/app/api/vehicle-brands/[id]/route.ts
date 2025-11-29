import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireSuperAdmin } from '@/lib/auth/clerk';
import { z } from 'zod';

const updateBrandSchema = z.object({
  name: z.string().min(1).optional(),
  isPopular: z.boolean().optional(),
  sortOrder: z.number().int().optional()
});

// PATCH /api/vehicle-brands/[id] - Update brand
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;

    const body = await req.json();
    const validatedData = updateBrandSchema.parse(body);

    const brand = await prisma.vehicleBrand.update({
      where: { id },
      data: validatedData
    });

    return NextResponse.json({ brand });
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
    console.error('Error updating brand:', error);
    return NextResponse.json(
      { error: 'Failed to update brand' },
      { status: 500 }
    );
  }
}

// DELETE /api/vehicle-brands/[id] - Delete brand
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;

    // Check if brand exists
    const brand = await prisma.vehicleBrand.findUnique({
      where: { id }
    });

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    // Check if brand is in use
    const vehiclesUsingBrand = await prisma.supplierVehicle.count({
      where: { brand: brand.name }
    });

    if (vehiclesUsingBrand > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete brand. ${vehiclesUsingBrand} vehicle(s) are using this brand.`
        },
        { status: 400 }
      );
    }

    await prisma.vehicleBrand.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error deleting brand:', error);
    return NextResponse.json(
      { error: 'Failed to delete brand' },
      { status: 500 }
    );
  }
}
