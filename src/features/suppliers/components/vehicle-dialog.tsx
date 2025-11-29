'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const vehicleSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  regNumber: z.string().min(1, 'Registration number is required'),
  model: z.string().optional()
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface VehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  supplierId: string;
  vehicle?: {
    id: string;
    category: string;
    regNumber: string;
    model?: string | null;
  } | null;
}

export function VehicleDialog({
  open,
  onOpenChange,
  onSuccess,
  supplierId,
  vehicle
}: VehicleDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!vehicle;

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      category: vehicle?.category || '',
      regNumber: vehicle?.regNumber || '',
      model: vehicle?.model || ''
    }
  });

  const onSubmit = async (data: VehicleFormData) => {
    setLoading(true);
    try {
      const url = isEditing
        ? `/api/suppliers/${supplierId}/vehicles/${vehicle.id}`
        : `/api/suppliers/${supplierId}/vehicles`;
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save vehicle');
      }

      toast.success(
        isEditing
          ? 'Vehicle updated successfully'
          : 'Vehicle created successfully'
      );
      onOpenChange(false);
      form.reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
          </DialogTitle>
        </DialogHeader>

        <Form
          form={form}
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-4'
        >
          <FormField
            control={form.control}
            name='regNumber'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registration Number *</FormLabel>
                <FormControl>
                  <Input placeholder='ABC123' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='category'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <FormControl>
                  <Input placeholder='e.g., Sedan, SUV' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='model'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input placeholder='e.g., Toyota Camry' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Saving...
                </>
              ) : (
                'Save Vehicle'
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
