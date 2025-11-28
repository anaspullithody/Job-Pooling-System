import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminOrAccountant } from '@/lib/auth/clerk';
import { z } from 'zod';

const createContactSchema = z
  .object({
    phone: z.string().optional(),
    email: z.string().email().optional()
  })
  .refine((data) => data.phone || data.email, {
    message: 'At least one contact method (phone or email) is required'
  });

// GET /api/suppliers/[id]/contacts - List contacts
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrAccountant();
    const { id } = await params;

    const contacts = await prisma.contact.findMany({
      where: { companyId: id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ contacts });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

// POST /api/suppliers/[id]/contacts - Create contact
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrAccountant();
    const { id } = await params;

    const body = await req.json();
    const validatedData = createContactSchema.parse(body);

    const contact = await prisma.contact.create({
      data: {
        companyId: id,
        ...validatedData
      }
    });

    return NextResponse.json({ contact }, { status: 201 });
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
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}
