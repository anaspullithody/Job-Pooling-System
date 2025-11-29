import { requireSuperAdmin } from '@/lib/auth/clerk';
import { SupplierForm } from '@/features/suppliers/components/supplier-form';

export default async function NewSupplierPage() {
  await requireSuperAdmin();

  return (
    <div className='flex-1 space-y-4 p-4 pt-6 md:p-8'>
      <h2 className='text-3xl font-bold tracking-tight'>Add New Supplier</h2>
      <SupplierForm />
    </div>
  );
}
