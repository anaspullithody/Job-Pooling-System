import { JobForm } from '@/features/jobs/components/job-form';
import { prisma } from '@/lib/db/prisma';
import { requireSuperAdmin } from '@/lib/auth/clerk';
import { currentUser } from '@clerk/nextjs/server';

async function getFormData() {
  await requireSuperAdmin();

  const [clients, suppliers, ownFleet, user] = await Promise.all([
    prisma.company.findMany({
      where: { kind: 'CLIENT' },
      orderBy: { name: 'asc' }
    }),
    prisma.company.findMany({
      where: { kind: 'SUPPLIER' },
      include: {
        supplierCategories: true,
        supplierVehicles: true
      },
      orderBy: { name: 'asc' }
    }),
    prisma.company.findFirst({
      where: { kind: 'OWN_FLEET' }
    }),
    currentUser()
  ]);

  const userEmail = user?.emailAddresses?.[0]?.emailAddress || 'Unknown';

  return { clients, suppliers, ownFleet, userEmail };
}

export default async function NewJobPage() {
  const { clients, suppliers, ownFleet, userEmail } = await getFormData();

  return (
    <div className='flex-1 space-y-4 p-4 pt-6 md:p-8'>
      <h2 className='text-3xl font-bold tracking-tight'>Create New Job</h2>
      <JobForm
        clients={clients}
        suppliers={suppliers}
        ownFleet={ownFleet}
        userEmail={userEmail}
      />
    </div>
  );
}
