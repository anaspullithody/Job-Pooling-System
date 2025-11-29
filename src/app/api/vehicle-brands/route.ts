import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminOrAccountant, requireSuperAdmin } from '@/lib/auth/clerk';
import { z } from 'zod';

const createBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  isPopular: z.boolean().optional()
});

// GET /api/vehicle-brands - List all brands
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

    const brands = await prisma.vehicleBrand.findMany({
      where,
      orderBy: [
        { isPopular: 'desc' }, // Popular brands first
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({ brands });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error fetching vehicle brands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}

// POST /api/vehicle-brands - Create brand
export async function POST(req: NextRequest) {
  try {
    await requireSuperAdmin();

    const body = await req.json();
    const validatedData = createBrandSchema.parse(body);

    // Check if brand already exists
    const existing = await prisma.vehicleBrand.findUnique({
      where: { name: validatedData.name }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Brand already exists' },
        { status: 400 }
      );
    }

    const brand = await prisma.vehicleBrand.create({
      data: {
        ...validatedData,
        sortOrder: 50 // Place in middle range
      }
    });

    return NextResponse.json({ brand }, { status: 201 });
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
    console.error('Error creating brand:', error);
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    );
  }
}
