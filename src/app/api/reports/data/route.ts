import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminOrAccountant } from '@/lib/auth/clerk';
import { ReportType, type ReportDataResponse } from '@/types/report';

export async function GET(req: NextRequest) {
  try {
    await requireAdminOrAccountant();

    const searchParams = req.nextUrl.searchParams;
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const type = searchParams.get('type') as ReportType;

    if (!dateFrom || !dateTo || !type) {
      return NextResponse.json(
        { error: 'Missing required parameters: dateFrom, dateTo, type' },
        { status: 400 }
      );
    }

    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999); // Include the entire end date

    // Fetch jobs within date range
    const jobs = await prisma.job.findMany({
      where: {
        createdAt: {
          gte: from,
          lte: to
        },
        deletedAt: null
      },
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        },
        supplier: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Convert Decimal to number and format data
    const formattedJobs = jobs.map((job) => ({
      id: job.id,
      guestName: job.guestName,
      guestContact: job.guestContact,
      pickup: job.pickup,
      drop: job.drop,
      flight: job.flight,
      pickupTime: job.pickupTime,
      vehicleModel: job.vehicleModel,
      status: job.status,
      price: job.price ? Number(job.price) : 0,
      taxAmount: job.taxAmount ? Number(job.taxAmount) : 0,
      totalAmount: job.totalAmount ? Number(job.totalAmount) : 0,
      createdAt: job.createdAt.toISOString(),
      clientName: job.client.name,
      supplierName: job.supplier?.name || null,
      driverName: job.driverName,
      assignedPlate: job.assignedPlate
    }));

    // Group data based on report type
    let data: any[] = [];

    switch (type) {
      case ReportType.SUPPLIER:
        // Group by supplier
        const supplierGroups = formattedJobs.reduce(
          (acc, job) => {
            const key = job.supplierName || 'No Supplier';
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(job);
            return acc;
          },
          {} as Record<string, typeof formattedJobs>
        );

        data = Object.entries(supplierGroups).flatMap(([supplierName, jobs]) =>
          jobs.map((job) => ({
            ...job,
            supplierName
          }))
        );
        break;

      case ReportType.CLIENT:
        // Group by client
        const clientGroups = formattedJobs.reduce(
          (acc, job) => {
            const key = job.clientName;
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(job);
            return acc;
          },
          {} as Record<string, typeof formattedJobs>
        );

        data = Object.entries(clientGroups).flatMap(([clientName, jobs]) =>
          jobs.map((job) => ({
            ...job,
            clientName
          }))
        );
        break;

      case ReportType.DAILY:
        // Group by date
        data = formattedJobs;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        );
    }

    const totalJobs = formattedJobs.length;
    const totalAmount = formattedJobs.reduce(
      (sum, job) => sum + job.totalAmount,
      0
    );

    const response: ReportDataResponse = {
      type,
      dateFrom,
      dateTo,
      data,
      totalJobs,
      totalAmount
    };

    return NextResponse.json(response);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error fetching report data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report data' },
      { status: 500 }
    );
  }
}
