import { requireSuperAdmin } from '@/lib/auth/clerk';
import { ClientForm } from '@/features/clients/components/client-form';

export default async function NewClientPage() {
  await requireSuperAdmin();

  return (
    <div className='flex-1 space-y-4 p-4 pt-6 md:p-8'>
      <h2 className='text-3xl font-bold tracking-tight'>Add New Client</h2>
      <ClientForm />
    </div>
  );
}
