import { z } from 'zod';

export const createDriverSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  vehiclePlate: z.string().min(1, 'Vehicle plate is required'),
  pin: z
    .string()
    .length(4, 'PIN must be exactly 4 digits')
    .regex(/^\d+$/, 'PIN must contain only digits')
});

export const updateDriverSchema = z.object({
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 characters')
    .optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  vehiclePlate: z.string().min(1, 'Vehicle plate is required').optional()
});

export const resetPinSchema = z.object({
  pin: z
    .string()
    .length(4, 'PIN must be exactly 4 digits')
    .regex(/^\d+$/, 'PIN must contain only digits')
});

export const driverChangePinSchema = z
  .object({
    currentPin: z.string().length(4, 'PIN must be exactly 4 digits'),
    newPin: z
      .string()
      .length(4, 'PIN must be exactly 4 digits')
      .regex(/^\d+$/, 'PIN must contain only digits'),
    confirmPin: z.string().length(4, 'PIN must be exactly 4 digits')
  })
  .refine((data) => data.newPin === data.confirmPin, {
    message: 'PINs do not match',
    path: ['confirmPin']
  });

export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;
export type ResetPinInput = z.infer<typeof resetPinSchema>;
export type DriverChangePinInput = z.infer<typeof driverChangePinSchema>;
