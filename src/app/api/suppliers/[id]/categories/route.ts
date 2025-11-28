import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminOrAccountant } from '@/lib/auth/clerk';
import { z } from 'zod';

const createCategorySchema = z.object({
  category: z.string().min(1, 'Category name is required'),
  vehicleCount: z.number().int().min(0).default(0)
});

// GET /api/suppliers/[id]/categories - List categories
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrAccountant();
    const { id } = await params;

    const categories = await prisma.supplierCategory.findMany({
      where: { companyId: id },
      orderBy: { category: 'asc' }
    });

    return NextResponse.json({ categories });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/suppliers/[id]/categories - Create category
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrAccountant();
    const { id } = await params;

    const body = await req.json();
    const validatedData = createCategorySchema.parse(body);

    const category = await prisma.supplierCategory.create({
      data: {
        companyId: id,
        ...validatedData
      }
    });

    return NextResponse.json({ category }, { status: 201 });
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
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
