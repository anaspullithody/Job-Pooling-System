import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminOrAccountant } from '@/lib/auth/clerk';

// GET /api/drivers/list-for-jobs - Get drivers formatted for job form dropdown
export async function GET(req: NextRequest) {
  try {
    await requireAdminOrAccountant();

    const drivers = await prisma.user.findMany({
      where: {
        role: 'DRIVER',
        name: { not: null },
        vehiclePlate: { not: null }
      },
      select: {
        id: true,
        name: true,
        vehiclePlate: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Format drivers for dropdown: "Name (Plate)"
    const formattedDrivers = drivers.map((driver) => ({
      id: driver.id,
      name: driver.name!,
      plate: driver.vehiclePlate!,
      label: `${driver.name} (${driver.vehiclePlate})`
    }));

    return NextResponse.json({ drivers: formattedDrivers });
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
