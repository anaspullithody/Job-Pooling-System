import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireSuperAdmin } from '@/lib/auth/clerk';
import { z } from 'zod';

const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  contacts: z
    .array(
      z.object({
        phone: z.string().optional(),
        email: z.string().email().optional()
      })
    )
    .optional()
});

// GET /api/clients - List clients
export async function GET() {
  try {
    await requireSuperAdmin();

    const clients = await prisma.company.findMany({
      where: { kind: 'CLIENT' },
      include: {
        contacts: true,
        clientJobs: {
          where: { deletedAt: null },
          select: {
            id: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5 // Recent jobs
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(clients);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/clients - Create client
export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin();

    const body = await request.json();
    const data = createClientSchema.parse(body);

    const client = await prisma.company.create({
      data: {
        kind: 'CLIENT',
        name: data.name,
        phone: data.phone,
        contacts: data.contacts
          ? {
              create: data.contacts
            }
          : undefined
      },
      include: {
        contacts: true
      }
    });

    return NextResponse.json(client, { status: 201 });
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
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
