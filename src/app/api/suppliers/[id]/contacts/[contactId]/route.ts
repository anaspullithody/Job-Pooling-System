import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminOrAccountant } from '@/lib/auth/clerk';
import { z } from 'zod';

const updateContactSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional()
});

// PATCH /api/suppliers/[id]/contacts/[contactId] - Update contact
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; contactId: string }> }
) {
  try {
    await requireAdminOrAccountant();
    const { contactId } = await params;

    const body = await req.json();
    const validatedData = updateContactSchema.parse(body);

    const contact = await prisma.contact.update({
      where: { id: contactId },
      data: validatedData
    });

    return NextResponse.json({ contact });
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
    console.error('Error updating contact:', error);
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

// DELETE /api/suppliers/[id]/contacts/[contactId] - Delete contact
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; contactId: string }> }
) {
  try {
    await requireAdminOrAccountant();
    const { contactId } = await params;

    await prisma.contact.delete({
      where: { id: contactId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error deleting contact:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}
