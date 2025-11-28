// Define enums directly to avoid Prisma client dependency in client components
export enum JobStatus {
  IN_POOL = 'IN_POOL',
  ASSIGNED = 'ASSIGNED',
  STARTED = 'STARTED',
  PICKED = 'PICKED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

export enum CompanyKind {
  CLIENT = 'CLIENT',
  SUPPLIER = 'SUPPLIER',
  OWN_FLEET = 'OWN_FLEET'
}

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
  action: 'status_change' | 'delete';
  status?: JobStatus;
}
