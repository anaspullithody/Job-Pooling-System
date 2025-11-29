import { ReportsView } from '@/features/reports/components/reports-view';
import { requireAdminOrAccountant } from '@/lib/auth/clerk';

export default async function ReportsPage() {
  await requireAdminOrAccountant();

  return (
    <div className='flex-1 space-y-4 p-4 pt-6 md:p-8'>
      <h2 className='text-3xl font-bold tracking-tight'>Reports</h2>
      <ReportsView />
    </div>
  );
}
