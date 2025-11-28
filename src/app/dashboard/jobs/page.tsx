import { Suspense } from "react";
import { JobPoolTable } from "@/features/jobs/components/job-pool-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireAdminOrAccountant } from "@/lib/auth/clerk";
import { JobFilters } from "./job-filters";
import { JobPoolTableWithBulk } from "./job-pool-with-bulk";

async function getJobs(filters: {
  status?: string;
  clientId?: string;
  supplierId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: string;
  limit?: string;
}) {
  await requireAdminOrAccountant();

  const page = parseInt(filters.page || "1");
  const limit = parseInt(filters.limit || "10");
  const skip = (page - 1) * limit;

  const where: any = {
    deletedAt: null,
  };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.clientId) {
    where.clientId = filters.clientId;
  }

  if (filters.supplierId) {
    where.supplierId = filters.supplierId;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) {
      where.createdAt.gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      where.createdAt.lte = new Date(filters.dateTo);
    }
  }

  if (filters.search) {
    where.OR = [
      { guestName: { contains: filters.search, mode: "insensitive" } },
      { guestContact: { contains: filters.search, mode: "insensitive" } },
      { pickup: { contains: filters.search, mode: "insensitive" } },
      { drop: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.job.count({ where }),
  ]);

  return { jobs, total, page, limit };
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    clientId?: string;
    supplierId?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page?: string;
    limit?: string;
  }>;
}) {
  const params = await searchParams;
  const { jobs, total, page, limit } = await getJobs(params);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Job Pool</h2>
        <Link href="/dashboard/jobs/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Job
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading filters...</div>}>
        <JobFilters />
      </Suspense>

      <Suspense fallback={<div>Loading jobs...</div>}>
        <JobPoolTableWithBulk jobs={jobs as any} />
      </Suspense>

      <div className="text-sm text-muted-foreground">
        Showing {jobs.length} of {total} jobs
      </div>
    </div>
  );
}

