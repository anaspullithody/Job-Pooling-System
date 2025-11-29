import { Suspense } from 'react';
import { JobPoolTable } from '@/features/jobs/components/job-pool-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/db/prisma';
import { requireAdminOrAccountant } from '@/lib/auth/clerk';
import { JobFilters } from './job-filters';
import { JobPoolTableWithBulk } from './job-pool-with-bulk';

async function getJobs(filters: {
  status?: string;
  clientId?: string;
  supplierId?: string;
  date?: string;
  search?: string;
  page?: string;
  limit?: string;
}) {
  await requireAdminOrAccountant();

  const page = parseInt(filters.page || '1');
  const limit = parseInt(filters.limit || '10');
  const skip = (page - 1) * limit;

  const where: any = {
    deletedAt: null
  };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.clientId && filters.clientId !== 'all') {
    where.clientId = filters.clientId;
  }

  if (filters.supplierId && filters.supplierId !== 'all') {
    where.supplierId = filters.supplierId;
  }

  // Single date filter - filter jobs created on this specific day
  if (filters.date) {
    const selectedDate = new Date(filters.date);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    where.createdAt = {
      gte: startOfDay,
      lte: endOfDay
    };
  }

  if (filters.search) {
    where.OR = [
      { guestName: { contains: filters.search, mode: 'insensitive' } },
      { guestContact: { contains: filters.search, mode: 'insensitive' } },
      { pickup: { contains: filters.search, mode: 'insensitive' } },
      { drop: { contains: filters.search, mode: 'insensitive' } }
    ];
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
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
      },
      skip,
      take: limit
    }),
    prisma.job.count({ where })
  ]);

  // Serialize Decimal fields to numbers for client components
  const serializedJobs = jobs.map((job) => ({
    ...job,
    price: job.price ? Number(job.price) : 0,
    taxAmount: job.taxAmount ? Number(job.taxAmount) : 0,
    totalAmount: job.totalAmount ? Number(job.totalAmount) : 0
  }));

  return { jobs: serializedJobs, total, page, limit };
}

async function getClientsAndSuppliers() {
  await requireAdminOrAccountant();

  const [clients, suppliers] = await Promise.all([
    prisma.company.findMany({
      where: { kind: 'CLIENT' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    }),
    prisma.company.findMany({
      where: { kind: 'SUPPLIER' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
  ]);

  return { clients, suppliers };
}

export default async function JobsPage({
  searchParams
}: {
  searchParams: Promise<{
    status?: string;
    clientId?: string;
    supplierId?: string;
    date?: string;
    search?: string;
    page?: string;
    limit?: string;
  }>;
}) {
  const params = await searchParams;
  const { jobs, total, page, limit } = await getJobs(params);
  const { clients, suppliers } = await getClientsAndSuppliers();

  // Check if user can edit
  const { getClerkUserRole } = await import('@/lib/auth/clerk');
  const { UserRole } = await import('@/types/user');
  const role = await getClerkUserRole();
  const canEdit = role === UserRole.SUPER_ADMIN;

  return (
    <div className='flex-1 space-y-4 p-4 pt-6 md:p-8'>
      <div className='flex items-center justify-between'>
        <h2 className='text-3xl font-bold tracking-tight'>Job Pool</h2>
        {canEdit && (
          <Link href='/dashboard/jobs/new'>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Create Job
            </Button>
          </Link>
        )}
      </div>

      <Suspense fallback={<div>Loading filters...</div>}>
        <JobFilters clients={clients} suppliers={suppliers} />
      </Suspense>

      <Suspense fallback={<div>Loading jobs...</div>}>
        <JobPoolTableWithBulk jobs={jobs as any} />
      </Suspense>

      <div className='text-muted-foreground text-sm'>
        Showing {jobs.length} of {total} jobs
      </div>
    </div>
  );
}
