'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional()
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  initialData?: any;
  clientId?: string;
}

export function ClientForm({ initialData, clientId }: ClientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: initialData?.name || '',
      phone: initialData?.phone || ''
    }
  });

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true);
    try {
      const url = clientId ? `/api/clients/${clientId}` : '/api/clients';
      const method = clientId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          kind: 'CLIENT'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save client');
      }

      toast.success(
        clientId ? 'Client updated successfully' : 'Client created successfully'
      );
      router.push('/dashboard/clients');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{clientId ? 'Edit Client' : 'Create New Client'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form
          form={form}
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-6'
        >
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name *</FormLabel>
                <FormControl>
                  <Input placeholder='ABC Travel Agency' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='phone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder='+971412345678' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.push('/dashboard/clients')}
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
                'Save Client'
              )}
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
