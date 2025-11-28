import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminOrAccountant } from '@/lib/auth/clerk';
import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';

// GET /api/reports/export - Export reports
export async function GET(request: NextRequest) {
  try {
    await requireAdminOrAccountant();

    const searchParams = request.nextUrl.searchParams;
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const type = searchParams.get('type'); // supplier, client, daily
    const format = searchParams.get('format'); // excel, pdf

    if (!dateFrom || !dateTo || !type || !format) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const where: any = {
      deletedAt: null,
      createdAt: {
        gte: new Date(dateFrom),
        lte: new Date(dateTo + 'T23:59:59')
      }
    };

    const jobs = await prisma.job.findMany({
      where,
      include: {
        client: true,
        supplier: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (format === 'excel') {
      return exportToExcel(jobs, type);
    } else if (format === 'pdf') {
      return await exportToPDF(jobs, type);
    } else {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error exporting report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function exportToExcel(jobs: any[], type: string) {
  let data: any[] = [];

  if (type === 'supplier') {
    // Group by supplier
    const grouped = jobs.reduce(
      (acc, job) => {
        const key = job.supplier?.name || 'No Supplier';
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(job);
        return acc;
      },
      {} as Record<string, any[]>
    );

    data = Object.entries(grouped).flatMap(([supplier, supplierJobs]) =>
      (supplierJobs as any[]).map((job: any) => ({
        Supplier: supplier,
        'Job ID': job.id,
        'Guest Name': job.guestName,
        'Guest Contact': job.guestContact,
        Pickup: job.pickup,
        Drop: job.drop,
        Status: job.status,
        'Total Amount': job.totalAmount || 0,
        'Created At': new Date(job.createdAt).toLocaleString()
      }))
    );
  } else if (type === 'client') {
    // Group by client
    data = jobs.map((job) => ({
      Client: job.client?.name || 'Unknown',
      'Job ID': job.id,
      'Guest Name': job.guestName,
      'Guest Contact': job.guestContact,
      Pickup: job.pickup,
      Drop: job.drop,
      Status: job.status,
      'Total Amount': job.totalAmount || 0,
      'Created At': new Date(job.createdAt).toLocaleString()
    }));
  } else if (type === 'daily') {
    // Daily summary
    const grouped = jobs.reduce(
      (acc, job) => {
        const date = new Date(job.createdAt).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = {
            date,
            total: 0,
            completed: 0,
            failed: 0,
            amount: 0
          };
        }
        acc[date].total++;
        if (job.status === 'COMPLETED') acc[date].completed++;
        if (job.status === 'FAILED') acc[date].failed++;
        acc[date].amount += Number(job.totalAmount || 0);
        return acc;
      },
      {} as Record<string, any>
    );

    data = Object.values(grouped).map((day: any) => ({
      Date: day.date,
      'Total Jobs': day.total,
      Completed: day.completed,
      Failed: day.failed,
      'Total Amount': day.amount
    }));
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="report.xlsx"`
    }
  });
}

async function exportToPDF(jobs: any[], type: string): Promise<NextResponse> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument();

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      resolve(
        new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="report.pdf"`
          }
        })
      );
    });
    doc.on('error', reject);

    doc.fontSize(20).text('Job Management Report', { align: 'center' });
    doc.moveDown();

    if (type === 'supplier') {
      const grouped = jobs.reduce(
        (acc, job) => {
          const key = job.supplier?.name || 'No Supplier';
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(job);
          return acc;
        },
        {} as Record<string, any[]>
      );

      Object.entries(grouped).forEach(([supplier, supplierJobs]) => {
        doc.fontSize(16).text(supplier, { underline: true });
        doc.moveDown(0.5);
        (supplierJobs as any[]).forEach((job: any) => {
          doc.fontSize(12).text(`Job ID: ${job.id}`);
          doc.text(`Guest: ${job.guestName}`);
          doc.text(`Pickup: ${job.pickup}`);
          doc.text(`Drop: ${job.drop}`);
          doc.text(`Status: ${job.status}`);
          doc.text(`Amount: AED ${job.totalAmount || 0}`);
          doc.moveDown();
        });
        doc.moveDown();
      });
    } else if (type === 'client') {
      jobs.forEach((job) => {
        doc.fontSize(12).text(`Client: ${job.client?.name || 'Unknown'}`);
        doc.text(`Job ID: ${job.id}`);
        doc.text(`Guest: ${job.guestName}`);
        doc.text(`Pickup: ${job.pickup}`);
        doc.text(`Drop: ${job.drop}`);
        doc.text(`Status: ${job.status}`);
        doc.text(`Amount: AED ${job.totalAmount || 0}`);
        doc.moveDown();
      });
    } else if (type === 'daily') {
      const grouped = jobs.reduce(
        (acc, job) => {
          const date = new Date(job.createdAt).toLocaleDateString();
          if (!acc[date]) {
            acc[date] = {
              date,
              total: 0,
              completed: 0,
              failed: 0,
              amount: 0
            };
          }
          acc[date].total++;
          if (job.status === 'COMPLETED') acc[date].completed++;
          if (job.status === 'FAILED') acc[date].failed++;
          acc[date].amount += Number(job.totalAmount || 0);
          return acc;
        },
        {} as Record<string, any>
      );

      Object.values(grouped).forEach((day: any) => {
        doc.fontSize(12).text(`Date: ${day.date}`);
        doc.text(`Total Jobs: ${day.total}`);
        doc.text(`Completed: ${day.completed}`);
        doc.text(`Failed: ${day.failed}`);
        doc.text(`Total Amount: AED ${day.amount}`);
        doc.moveDown();
      });
    }

    doc.end();
  });
}
