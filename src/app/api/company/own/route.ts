import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminOrAccountant } from '@/lib/auth/clerk';

export async function GET() {
  try {
    await requireAdminOrAccountant();

    const ownCompany = await prisma.company.findFirst({
      where: { kind: 'OWN_FLEET' },
      select: { name: true, phone: true }
    });

    if (!ownCompany) {
      return NextResponse.json({
        name: 'Job Pooling',
        phone: null
      });
    }

    return NextResponse.json(ownCompany);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error fetching own company:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}
