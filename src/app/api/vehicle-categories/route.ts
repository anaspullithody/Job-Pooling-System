import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminOrAccountant, requireSuperAdmin } from '@/lib/auth/clerk';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional()
});

// GET /api/vehicle-categories - List all categories
export async function GET(req: NextRequest) {
  try {
    await requireAdminOrAccountant();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    const where: any = {};
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const categories = await prisma.vehicleCategory.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
    });

    return NextResponse.json({ categories });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error fetching vehicle categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/vehicle-categories - Create custom category
export async function POST(req: NextRequest) {
  try {
    await requireSuperAdmin();

    const body = await req.json();
    const validatedData = createCategorySchema.parse(body);

    // Check if category already exists
    const existing = await prisma.vehicleCategory.findUnique({
      where: { name: validatedData.name }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 400 }
      );
    }

    const category = await prisma.vehicleCategory.create({
      data: {
        ...validatedData,
        isCustom: true, // User-created categories are custom
        sortOrder: 50 // Place between standard and "Custom/Special"
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
