import { notFound } from "next/navigation";
import { JobForm } from "@/features/jobs/components/job-form";
import { prisma } from "@/lib/db/prisma";
import { requireSuperAdmin } from "@/lib/auth/clerk";

async function getFormData(jobId: string) {
  await requireSuperAdmin();

  const [job, clients, suppliers, ownFleet] = await Promise.all([
    prisma.job.findFirst({
      where: {
        id: jobId,
        deletedAt: null,
      },
      include: {
        client: true,
        supplier: true,
      },
    }),
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

  return { job, clients, suppliers, ownFleet };
}

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { job, clients, suppliers, ownFleet } = await getFormData(id);

  if (!job) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Edit Job</h2>
      <JobForm
        clients={clients}
        suppliers={suppliers}
        ownFleet={ownFleet}
        initialData={{
          clientId: job.clientId,
          supplierId: job.supplierId || "",
          guestName: job.guestName,
          guestContact: job.guestContact,
          pickup: job.pickup,
          drop: job.drop,
          flight: job.flight || "",
          category: job.category || "",
          vehicle: job.vehicle || "",
          price: job.price ? Number(job.price) : undefined,
          taxAmount: job.taxAmount ? Number(job.taxAmount) : undefined,
          totalAmount: job.totalAmount ? Number(job.totalAmount) : undefined,
          driverName: job.driverName || "",
          assignedPlate: job.assignedPlate || "",
        }}
        jobId={id}
      />
    </div>
  );
}

