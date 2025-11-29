import { prisma } from '@/lib/db/prisma';
import { requireAdminOrAccountant, getClerkUserRole } from '@/lib/auth/clerk';
import { UserRole } from '@/types/user';
import { ClientList } from '@/features/clients/components/client-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

async function getClients() {
  await requireAdminOrAccountant();

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
        take: 5
      }
    },
    orderBy: { name: 'asc' }
  });

  return clients;
}

export default async function ClientsPage() {
  const clients = await getClients();
  const role = await getClerkUserRole();
  const canEdit = role === UserRole.SUPER_ADMIN;

  return (
    <div className='flex-1 space-y-4 p-4 pt-6 md:p-8'>
      <div className='flex items-center justify-between'>
        <h2 className='text-3xl font-bold tracking-tight'>Clients</h2>
        {canEdit && (
          <Link href='/dashboard/clients/new'>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Add Client
            </Button>
          </Link>
        )}
      </div>
      <ClientList clients={clients as any} canEdit={canEdit} />
    </div>
  );
}
