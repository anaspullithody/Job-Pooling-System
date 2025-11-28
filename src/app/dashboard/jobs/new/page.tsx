import { JobForm } from "@/features/jobs/components/job-form";
import { prisma } from "@/lib/db/prisma";
import { requireSuperAdmin } from "@/lib/auth/clerk";

async function getFormData() {
  await requireSuperAdmin();

  const [clients, suppliers, ownFleet] = await Promise.all([
    prisma.company.findMany({
      where: { kind: "CLIENT" },
      orderBy: { name: "asc" },
    }),
    prisma.company.findMany({
      where: { kind: "SUPPLIER" },
      include: {
        supplierCategories: true,
        supplierVehicles: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.company.findFirst({
      where: { kind: "OWN_FLEET" },
    }),
  ]);

  return { clients, suppliers, ownFleet };
}

export default async function NewJobPage() {
  const { clients, suppliers, ownFleet } = await getFormData();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Create New Job</h2>
      <JobForm clients={clients} suppliers={suppliers} ownFleet={ownFleet} />
    </div>
  );
}

