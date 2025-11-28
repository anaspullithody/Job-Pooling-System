import { JobStatus, CompanyKind } from "@prisma/client";

export type { JobStatus, CompanyKind };

export interface JobFilters {
  status?: JobStatus;
  clientId?: string;
  supplierId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface BulkJobAction {
  jobIds: string[];
  action: "status_change" | "delete";
  status?: JobStatus;
}

