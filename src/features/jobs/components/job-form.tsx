'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createJobSchema, type CreateJobInput } from '../schemas/job';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Company } from '@prisma/client';

interface JobFormProps {
  clients: Company[];
  suppliers: Company[];
  ownFleet: Company | null;
  initialData?: any;
  jobId?: string;
}

export function JobForm({
  clients,
  suppliers,
  ownFleet,
  initialData,
  jobId
}: JobFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    initialData?.supplierId || null
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);

  const form = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: initialData || {
      clientId: '',
      supplierId: '',
      guestName: '',
      guestContact: '',
      pickup: '',
      drop: '',
      flight: '',
      category: '',
      vehicle: '',
      price: undefined,
      taxAmount: undefined,
      totalAmount: undefined,
      driverName: '',
      assignedPlate: ''
    }
  });

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);
  const isOwnFleet = selectedSupplierId === ownFleet?.id;

  // Load categories and vehicles when supplier changes
  useEffect(() => {
    if (selectedSupplier) {
      // Get categories from supplier
      // This would need to be fetched from API or passed as prop
      // For now, we'll use a simplified approach
    }
  }, [selectedSupplierId]);

  const onSubmit = async (data: CreateJobInput) => {
    setLoading(true);
    try {
      const url = jobId ? `/api/jobs/${jobId}` : '/api/jobs';
      const method = jobId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save job');
      }

      router.push('/dashboard/jobs');
      router.refresh();
    } catch (error: any) {
      console.error('Error saving job:', error);
      alert(error.message || 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{jobId ? 'Edit Job' : 'New Job'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form
          form={form}
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-6'
        >
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='clientId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select client' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='supplierId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedSupplierId(value);
                      form.setValue('category', '');
                      form.setValue('vehicle', '');
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select supplier' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ownFleet && (
                        <SelectItem value={ownFleet.id}>Own Company</SelectItem>
                      )}
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {isOwnFleet && (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='driverName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Driver Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Enter driver name' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='assignedPlate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Plate *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Enter plate number' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='guestName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guest Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter guest name' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='guestContact'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guest Contact *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='+971501234567' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='pickup'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pickup Location *</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder='Enter pickup location' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='drop'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Drop Location *</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder='Enter drop location' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='flight'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Flight Info</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='e.g., EK 201' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <FormField
              control={form.control}
              name='price'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (AED)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='0.01'
                      {...field}
                      value={field.value || ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='taxAmount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax (AED)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='0.01'
                      {...field}
                      value={field.value || ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='totalAmount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total (AED)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='0.01'
                      {...field}
                      value={field.value || ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='flex justify-end gap-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.back()}
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
                'Save Job'
              )}
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
