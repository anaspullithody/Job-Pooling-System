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
  resetPinSchema,
  type ResetPinInput
} from '@/features/drivers/schemas/driver';
import { Loader2 } from 'lucide-react';

interface ResetPinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  driver: {
    id: string;
    phone: string;
  } | null;
}

export function ResetPinDialog({
  open,
  onOpenChange,
  onSuccess,
  driver
}: ResetPinDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<ResetPinInput>({
    resolver: zodResolver(resetPinSchema),
    defaultValues: {
      pin: ''
    }
  });

  const onSubmit = async (values: ResetPinInput) => {
    if (!driver) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/drivers/${driver.id}/reset-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to reset PIN');
      }

      toast.success(
        'PIN reset successfully. Driver must change it on next login.'
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
          <DialogTitle>Reset Driver PIN</DialogTitle>
          <DialogDescription>
            Reset PIN for driver: <strong>{driver?.phone}</strong>
            <br />
            The driver will be required to change this PIN on next login.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='pin'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Temporary PIN *</FormLabel>
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
                    Enter a 4-digit temporary PIN
                  </p>
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
                    Resetting...
                  </>
                ) : (
                  'Reset PIN'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
