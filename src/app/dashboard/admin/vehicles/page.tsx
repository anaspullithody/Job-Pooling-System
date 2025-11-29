import { requireSuperAdmin } from '@/lib/auth/clerk';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoryManagement } from '@/features/admin/components/category-management';
import { BrandManagement } from '@/features/admin/components/brand-management';

export default async function VehicleMasterDataPage() {
  await requireSuperAdmin();

  return (
    <div className='flex-1 space-y-4 p-4 pt-6 md:p-8'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>
          Vehicle Master Data
        </h2>
        <p className='text-muted-foreground'>
          Manage vehicle categories and brands for the system
        </p>
      </div>

      <Tabs defaultValue='categories' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='categories'>Categories</TabsTrigger>
          <TabsTrigger value='brands'>Brands</TabsTrigger>
        </TabsList>

        <TabsContent value='categories' className='space-y-4'>
          <CategoryManagement />
        </TabsContent>

        <TabsContent value='brands' className='space-y-4'>
          <BrandManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
