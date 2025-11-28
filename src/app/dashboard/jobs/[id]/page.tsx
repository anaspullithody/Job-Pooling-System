import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { requireAdminOrAccountant, requireSuperAdmin } from '@/lib/auth/clerk';
import { JobDetailView } from '@/features/jobs/components/job-detail-view';
import { getClerkUserRole } from '@/lib/auth/clerk';

async function getJob(id: string) {
  await requireAdminOrAccountant();

  const job = await prisma.job.findFirst({
    where: {
      id,
      deletedAt: null
    },
    include: {
      client: {
        include: {
          contacts: true
        }
      },
      supplier: {
        include: {
          contacts: true,
          supplierCategories: true,
          supplierVehicles: true
        }
      },
      jobLogs: {
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      invoice: true
    }
  });

  if (!job) return null;

  // Serialize Decimal fields for client components
  return {
    ...job,
    price: job.price ? Number(job.price) : 0,
    taxAmount: job.taxAmount ? Number(job.taxAmount) : 0,
    totalAmount: job.totalAmount ? Number(job.totalAmount) : 0
  };
}

export default async function JobDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJob(id);
  const userRole = await getClerkUserRole();

  if (!job) {
    notFound();
  }

  const canEdit = userRole === 'SUPER_ADMIN';

  return (
    <div className='flex-1 space-y-4 p-4 pt-6 md:p-8'>
      <JobDetailView job={job as any} canEdit={canEdit} />
    </div>
  );
}
