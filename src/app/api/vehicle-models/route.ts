import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminOrAccountant, requireSuperAdmin } from '@/lib/auth/clerk';
import { z } from 'zod';

const createModelSchema = z.object({
  name: z.string().min(1, 'Model name is required'),
  brandName: z.string().min(1, 'Brand name is required'),
  category: z.string().optional(),
  isPopular: z.boolean().optional()
});

// GET /api/vehicle-models - List all models (optional brand filter)
export async function GET(req: NextRequest) {
  try {
    await requireAdminOrAccountant();

    const { searchParams } = new URL(req.url);
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');

    const where: any = {};

    if (brand) {
      where.brandName = brand;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const models = await prisma.vehicleModel.findMany({
      where,
      orderBy: [
        { isPopular: 'desc' }, // Popular models first
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({ models });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error fetching vehicle models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}

// POST /api/vehicle-models - Create model
export async function POST(req: NextRequest) {
  try {
    await requireSuperAdmin();

    const body = await req.json();
    const validatedData = createModelSchema.parse(body);

    // Check if model already exists for this brand
    const existing = await prisma.vehicleModel.findUnique({
      where: {
        name_brandName: {
          name: validatedData.name,
          brandName: validatedData.brandName
        }
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Model already exists for this brand' },
        { status: 400 }
      );
    }

    const model = await prisma.vehicleModel.create({
      data: {
        ...validatedData,
        sortOrder: 50
      }
    });

    return NextResponse.json({ model }, { status: 201 });
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
    console.error('Error creating model:', error);
    return NextResponse.json(
      { error: 'Failed to create model' },
      { status: 500 }
    );
  }
}
