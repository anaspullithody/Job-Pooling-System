import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireSuperAdmin } from '@/lib/auth/clerk';
import { createDriverSchema } from '@/features/drivers/schemas/driver';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// GET /api/drivers - List all drivers
export async function GET(req: NextRequest) {
  try {
    await requireSuperAdmin();

    const drivers = await prisma.user.findMany({
      where: {
        role: 'DRIVER'
      },
      select: {
        id: true,
        phone: true,
        pinTemp: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ drivers });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error fetching drivers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drivers' },
      { status: 500 }
    );
  }
}

// POST /api/drivers - Create new driver
export async function POST(req: NextRequest) {
  try {
    await requireSuperAdmin();

    const body = await req.json();
    const validatedData = createDriverSchema.parse(body);

    // Check if driver already exists
    const existingDriver = await prisma.user.findUnique({
      where: { phone: validatedData.phone }
    });

    if (existingDriver) {
      return NextResponse.json(
        { error: 'Driver with this phone number already exists' },
        { status: 400 }
      );
    }

    // Hash PIN
    const pinHash = await bcrypt.hash(validatedData.pin, 10);

    // Create driver
    const driver = await prisma.user.create({
      data: {
        phone: validatedData.phone,
        pinHash,
        pinTemp: true, // Mark as temporary PIN
        role: 'DRIVER'
      },
      select: {
        id: true,
        phone: true,
        pinTemp: true,
        createdAt: true
      }
    });

    return NextResponse.json({ driver }, { status: 201 });
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
    console.error('Error creating driver:', error);
    return NextResponse.json(
      { error: 'Failed to create driver' },
      { status: 500 }
    );
  }
}
