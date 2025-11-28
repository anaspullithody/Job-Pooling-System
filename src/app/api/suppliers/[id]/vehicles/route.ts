import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminOrAccountant } from '@/lib/auth/clerk';
import { z } from 'zod';

const createVehicleSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  regNumber: z.string().min(1, 'Registration number is required'),
  model: z.string().optional()
});

// GET /api/suppliers/[id]/vehicles - List vehicles
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrAccountant();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const where: any = { supplierId: id };
    if (category) {
      where.category = category;
    }

    const vehicles = await prisma.supplierVehicle.findMany({
      where,
      orderBy: { regNumber: 'asc' }
    });

    return NextResponse.json({ vehicles });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}

// POST /api/suppliers/[id]/vehicles - Create vehicle
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrAccountant();
    const { id } = await params;

    const body = await req.json();
    const validatedData = createVehicleSchema.parse(body);

    const vehicle = await prisma.supplierVehicle.create({
      data: {
        supplierId: id,
        category: validatedData.category,
        regNumber: validatedData.regNumber,
        model: validatedData.model
      }
    });

    return NextResponse.json({ vehicle }, { status: 201 });
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
    console.error('Error creating vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to create vehicle' },
      { status: 500 }
    );
  }
}
