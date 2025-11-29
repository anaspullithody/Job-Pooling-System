import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireSuperAdmin } from '@/lib/auth/clerk';
import { z } from 'zod';

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().optional()
});

// PATCH /api/vehicle-categories/[id] - Update category
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;

    const body = await req.json();
    const validatedData = updateCategorySchema.parse(body);

    const category = await prisma.vehicleCategory.update({
      where: { id },
      data: validatedData
    });

    return NextResponse.json({ category });
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
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/vehicle-categories/[id] - Delete category (custom only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;

    // Check if category is custom (only custom can be deleted)
    const category = await prisma.vehicleCategory.findUnique({
      where: { id }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    if (!category.isCustom) {
      return NextResponse.json(
        { error: 'Cannot delete system categories' },
        { status: 400 }
      );
    }

    // Check if category is in use
    const vehiclesUsingCategory = await prisma.supplierVehicle.count({
      where: { category: category.name }
    });

    if (vehiclesUsingCategory > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category. ${vehiclesUsingCategory} vehicle(s) are using this category.`
        },
        { status: 400 }
      );
    }

    await prisma.vehicleCategory.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
