export enum ReportType {
  SUPPLIER = 'supplier',
  CLIENT = 'client',
  DAILY = 'daily'
}

export interface BaseReportRow {
  id: string;
  guestName: string;
  guestContact: string;
  pickup: string;
  drop: string;
  flight?: string | null;
  pickupTime?: string | null;
  vehicleModel?: string | null;
  status: string;
  price: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: string;
}

export interface SupplierReportRow extends BaseReportRow {
  supplierName: string;
  clientName: string;
  driverName?: string | null;
  assignedPlate?: string | null;
}

export interface ClientReportRow extends BaseReportRow {
  clientName: string;
  supplierName?: string | null;
  driverName?: string | null;
  assignedPlate?: string | null;
}

export interface DailySummaryRow extends BaseReportRow {
  clientName: string;
  supplierName?: string | null;
  driverName?: string | null;
  assignedPlate?: string | null;
}

export interface ReportDataResponse {
  type: ReportType;
  dateFrom: string;
  dateTo: string;
  data: SupplierReportRow[] | ClientReportRow[] | DailySummaryRow[];
  totalJobs: number;
  totalAmount: number;
}

export interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  type: ReportType;
}
