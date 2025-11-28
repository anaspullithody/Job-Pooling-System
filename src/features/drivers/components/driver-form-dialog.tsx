'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { toast } from 'sonner';
import {
  createDriverSchema,
  updateDriverSchema,
  type CreateDriverInput
} from '@/features/drivers/schemas/driver';
import { Loader2 } from 'lucide-react';

interface DriverFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  driver?: {
    id: string;
    phone: string;
  } | null;
}

export function DriverFormDialog({
  open,
  onOpenChange,
  onSuccess,
  driver
}: DriverFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!driver;

  const form = useForm<CreateDriverInput>({
    resolver: zodResolver(isEditing ? updateDriverSchema : createDriverSchema),
    defaultValues: {
      phone: driver?.phone || '',
      pin: ''
    }
  });

  const onSubmit = async (values: CreateDriverInput) => {
    setLoading(true);
    try {
      const url = isEditing ? `/api/drivers/${driver.id}` : '/api/drivers';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save driver');
      }

      toast.success(
        isEditing
          ? 'Driver updated successfully'
          : 'Driver created successfully'
      );
      onOpenChange(false);
      form.reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Driver' : 'Create New Driver'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update driver information.'
              : 'Create a new driver with a temporary 4-digit PIN.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <Input placeholder='+971501234567' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditing && (
              <FormField
                control={form.control}
                name='pin'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temporary PIN *</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='1234'
                        maxLength={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className='text-muted-foreground text-xs'>
                      Driver will be required to change this PIN on first login
                    </p>
                  </FormItem>
                )}
              />
            )}

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
                ) : isEditing ? (
                  'Update Driver'
                ) : (
                  'Create Driver'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
