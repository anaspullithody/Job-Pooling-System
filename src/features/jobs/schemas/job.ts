import { z } from 'zod';
import { JobStatus } from '@/types/job';

export const createJobSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  supplierId: z.string().optional(),
  guestName: z.string().min(1, 'Guest name is required'),
  numberOfAdults: z.number().int().positive().optional(),
  guestContact: z.string().min(1, 'Guest contact is required'),
  pickup: z.string().min(1, 'Pickup location is required'),
  drop: z.string().min(1, 'Drop location is required'),
  flight: z.string().optional(),
  pickupTime: z.string().optional(),
  category: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicle: z.string().optional(),
  price: z.number().min(0).optional(),
  taxAmount: z.number().min(0).optional(),
  totalAmount: z.number().min(0).optional(),
  driverName: z.string().optional(),
  assignedPlate: z.string().optional(),
  remarks: z.string().optional()
});

export const updateJobSchema = createJobSchema.extend({
  status: z.nativeEnum(JobStatus).optional(),
  failureReason: z.string().optional()
});

export const bulkJobActionSchema = z.object({
  jobIds: z.array(z.string()).min(1, 'At least one job must be selected'),
  action: z.enum(['status_change', 'delete']),
  status: z.nativeEnum(JobStatus).optional()
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type BulkJobActionInput = z.infer<typeof bulkJobActionSchema>;
