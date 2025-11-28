import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireSuperAdmin } from '@/lib/auth/clerk';
import { z } from 'zod';

const createSupplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  contacts: z
    .array(
      z.object({
        phone: z.string().optional(),
        email: z.string().email().optional()
      })
    )
    .optional(),
  categories: z
    .array(
      z.object({
        category: z.string().min(1),
        vehicleCount: z.number().int().min(0)
      })
    )
    .optional(),
  vehicles: z
    .array(
      z.object({
        category: z.string().min(1),
        regNumber: z.string().min(1),
        model: z.string().optional()
      })
    )
    .optional()
});

// GET /api/suppliers - List suppliers
export async function GET() {
  try {
    await requireSuperAdmin();

    const suppliers = await prisma.company.findMany({
      where: { kind: 'SUPPLIER' },
      include: {
        contacts: true,
        supplierCategories: true,
        supplierVehicles: true
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(suppliers);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/suppliers - Create supplier
export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin();

    const body = await request.json();
    const data = createSupplierSchema.parse(body);

    const supplier = await prisma.company.create({
      data: {
        kind: 'SUPPLIER',
        name: data.name,
        phone: data.phone,
        contacts: data.contacts
          ? {
              create: data.contacts
            }
          : undefined,
        supplierCategories: data.categories
          ? {
              create: data.categories
            }
          : undefined,
        supplierVehicles: data.vehicles
          ? {
              create: data.vehicles
            }
          : undefined
      },
      include: {
        contacts: true,
        supplierCategories: true,
        supplierVehicles: true
      }
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating supplier:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
