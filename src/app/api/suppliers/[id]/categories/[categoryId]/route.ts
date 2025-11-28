import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminOrAccountant } from '@/lib/auth/clerk';
import { z } from 'zod';

const updateCategorySchema = z.object({
  category: z.string().min(1).optional(),
  vehicleCount: z.number().int().min(0).optional()
});

// PATCH /api/suppliers/[id]/categories/[categoryId] - Update category
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    await requireAdminOrAccountant();
    const { categoryId } = await params;

    const body = await req.json();
    const validatedData = updateCategorySchema.parse(body);

    const category = await prisma.supplierCategory.update({
      where: { id: categoryId },
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

// DELETE /api/suppliers/[id]/categories/[categoryId] - Delete category
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    await requireAdminOrAccountant();
    const { categoryId, id: supplierId } = await params;

    // Get the category to find its category string value
    const category = await prisma.supplierCategory.findUnique({
      where: { id: categoryId },
      select: { category: true }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Delete all vehicles in this category first (using category string, not categoryId)
    await prisma.supplierVehicle.deleteMany({
      where: {
        supplierId,
        category: category.category
      }
    });

    await prisma.supplierCategory.delete({
      where: { id: categoryId }
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
