'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const brandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  isPopular: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional()
});

type BrandFormData = z.infer<typeof brandSchema>;

interface BrandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: {
    id: string;
    name: string;
    isPopular: boolean;
    sortOrder: number;
  } | null;
  onSuccess: () => void;
}

export function BrandDialog({
  open,
  onOpenChange,
  brand,
  onSuccess
}: BrandDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!brand;

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: brand?.name || '',
      isPopular: brand?.isPopular || false,
      sortOrder: brand?.sortOrder || 50
    }
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: brand?.name || '',
        isPopular: brand?.isPopular || false,
        sortOrder: brand?.sortOrder || 50
      });
    }
  }, [open, brand, form]);

  const onSubmit = async (data: BrandFormData) => {
    setLoading(true);
    try {
      const url = isEditing
        ? `/api/vehicle-brands/${brand.id}`
        : '/api/vehicle-brands';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save brand');
      }

      toast.success(
        isEditing ? 'Brand updated successfully' : 'Brand created successfully'
      );
      onOpenChange(false);
      form.reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Brand' : 'Add New Brand'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update vehicle brand details.'
              : 'Add a new vehicle brand to the system.'}
          </DialogDescription>
        </DialogHeader>

        <Form
          form={form}
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-4'
        >
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand Name *</FormLabel>
                <FormControl>
                  <Input placeholder='e.g., Toyota, BMW' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='isPopular'
            render={({ field }) => (
              <FormItem className='flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel>Popular Brand</FormLabel>
                  <FormDescription>
                    Popular brands appear first in dropdown lists
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='sortOrder'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sort Order</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Lower numbers appear first in lists
                </FormDescription>
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
              ) : isEditing ? (
                'Update Brand'
              ) : (
                'Add Brand'
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
