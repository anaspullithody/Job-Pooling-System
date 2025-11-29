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
import { format } from 'date-fns';

interface JobFormProps {
  clients: Company[];
  suppliers: Company[];
  ownFleet: Company | null;
  initialData?: any;
  jobId?: string;
  userEmail?: string;
}

interface Driver {
  id: string;
  name: string;
  plate: string;
  label: string;
}

export function JobForm({
  clients,
  suppliers,
  ownFleet,
  initialData,
  jobId,
  userEmail
}: JobFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    initialData?.supplierId || null
  );

  const form = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: initialData || {
      clientId: '',
      supplierId: '',
      guestName: '',
      numberOfAdults: undefined,
      guestContact: '',
      pickup: '',
      drop: '',
      flight: '',
      pickupTime: '',
      category: '',
      vehicleModel: '',
      vehicle: '',
      price: undefined,
      taxAmount: undefined,
      totalAmount: undefined,
      driverName: '',
      assignedPlate: '',
      remarks: ''
    }
  });

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);
  const isOwnFleet = selectedSupplierId === ownFleet?.id;

  // Fetch drivers for dropdown
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await fetch('/api/drivers/list-for-jobs');
        if (res.ok) {
          const data = await res.json();
          setDrivers(data.drivers);
        }
      } catch (error) {
        console.error('Failed to fetch drivers:', error);
      }
    };
    fetchDrivers();
  }, []);

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
          {/* Row 1: Client and Date */}
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

            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input
                  value={format(new Date(), 'dd-MM-yyyy')}
                  disabled
                  className='bg-muted'
                />
              </FormControl>
            </FormItem>
          </div>

          {/* Row 2: Guest Name and Number of Adults */}
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
              name='numberOfAdults'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No. of Adults</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      {...field}
                      value={field.value || ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                      placeholder='e.g., 2+luggage'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 3: Guest Contact and Pickup Location */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
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

            <FormField
              control={form.control}
              name='pickup'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pickup Location *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='e.g., Terminal 3' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 4: Flight NO and Pickup Time */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='flight'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flight NO</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='e.g., EK 184' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='pickupTime'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pickup Time</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='e.g., 12:20 AM' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 5: Drop Location and Vehicle Type (Model) */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='drop'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Drop Location *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='e.g., Maison Mall Street' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='vehicleModel'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Type</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='e.g., KIA, MINI BUS' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 6: Supplier Selection */}
          <FormField
            control={form.control}
            name='supplierId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier / Own Company</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedSupplierId(value);
                    form.setValue('driverName', '');
                    form.setValue('assignedPlate', '');
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select supplier or own company' />
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

          {/* Row 7: Driver Details (conditional) */}
          {isOwnFleet && (
            <FormField
              control={form.control}
              name='driverName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Driver *</FormLabel>
                  <Select
                    onValueChange={(driverId) => {
                      const driver = drivers.find((d) => d.id === driverId);
                      if (driver) {
                        form.setValue('driverName', driver.name);
                        form.setValue('assignedPlate', driver.plate);
                        field.onChange(driver.name);
                      }
                    }}
                    value={
                      drivers.find((d) => d.name === field.value)?.id || ''
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select driver' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Driver and vehicle will be assigned to this job
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {selectedSupplierId && !isOwnFleet && (
            <div className='bg-muted/50 rounded-md border p-4'>
              <div className='text-sm'>
                <span className='font-semibold'>Supplier Driver:</span>{' '}
                {suppliers.find((s) => s.id === selectedSupplierId)?.name ||
                  'N/A'}
              </div>
              <p className='text-muted-foreground mt-1 text-xs'>
                Driver will be assigned by the supplier
              </p>
            </div>
          )}

          {/* Row 8: Remarks */}
          <FormField
            control={form.control}
            name='remarks'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remarks / Notes</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='Enter any additional notes or remarks...'
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Row 9: Pricing */}
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

          {/* Hidden field for entered by (will be auto-filled in API) */}
          {userEmail && (
            <div className='text-muted-foreground text-sm'>
              Entered by: {userEmail}
            </div>
          )}

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
