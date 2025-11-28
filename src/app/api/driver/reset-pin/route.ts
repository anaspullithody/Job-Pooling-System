import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { driverChangePinSchema } from '@/features/drivers/schemas/driver';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// POST /api/driver/reset-pin - Driver changes their own PIN
export async function POST(req: NextRequest) {
  try {
    // Get driver from token
    const token = req.cookies.get('driver_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      phone: string;
      role: string;
    };

    const body = await req.json();
    const validatedData = driverChangePinSchema.parse(body);

    // Get driver
    const driver = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!driver || driver.role !== 'DRIVER') {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Verify current PIN
    const isValidPin = await bcrypt.compare(
      validatedData.currentPin,
      driver.pinHash || ''
    );

    if (!isValidPin) {
      return NextResponse.json(
        { error: 'Current PIN is incorrect' },
        { status: 400 }
      );
    }

    // Hash new PIN
    const newPinHash = await bcrypt.hash(validatedData.newPin, 10);

    // Update driver PIN and mark as permanent
    await prisma.user.update({
      where: { id: driver.id },
      data: {
        pinHash: newPinHash,
        pinTemp: false // Mark as permanent
      }
    });

    return NextResponse.json({
      success: true,
      message: 'PIN changed successfully'
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error changing PIN:', error);
    return NextResponse.json(
      { error: 'Failed to change PIN' },
      { status: 500 }
    );
  }
}
