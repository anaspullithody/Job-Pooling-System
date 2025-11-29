'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
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
  driverChangePinSchema,
  type DriverChangePinInput
} from '@/features/drivers/schemas/driver';
import { Loader2 } from 'lucide-react';

export default function DriverResetPinPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<DriverChangePinInput>({
    resolver: zodResolver(driverChangePinSchema),
    defaultValues: {
      currentPin: '',
      newPin: '',
      confirmPin: ''
    }
  });

  const onSubmit = async (values: DriverChangePinInput) => {
    setLoading(true);
    try {
      const res = await fetch('/api/driver/reset-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to change PIN');
      }

      toast.success('PIN changed successfully!');
      router.push('/driver/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Change PIN</CardTitle>
          <CardDescription>
            Change your temporary PIN to a permanent one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form
            form={form}
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='currentPin'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current PIN *</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Enter current PIN'
                      maxLength={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='newPin'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New PIN *</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Enter new 4-digit PIN'
                      maxLength={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='confirmPin'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New PIN *</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Re-enter new PIN'
                      maxLength={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.back()}
                disabled={loading}
                className='flex-1'
              >
                Cancel
              </Button>
              <Button type='submit' disabled={loading} className='flex-1'>
                {loading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Changing...
                  </>
                ) : (
                  'Change PIN'
                )}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
