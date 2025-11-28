import { prisma } from "@/lib/db/prisma";
import { requireSuperAdmin } from "@/lib/auth/clerk";
import { SupplierList } from "@/features/suppliers/components/supplier-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

async function getSuppliers() {
  await requireSuperAdmin();

  const suppliers = await prisma.company.findMany({
    where: { kind: "SUPPLIER" },
    include: {
      contacts: true,
      supplierCategories: true,
      supplierVehicles: true,
    },
    orderBy: { name: "asc" },
  });

  return suppliers;
}

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Suppliers</h2>
        <Link href="/dashboard/suppliers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </Link>
      </div>
      <SupplierList suppliers={suppliers as any} />
    </div>
  );
}

