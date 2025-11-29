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
  DialogTitle
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
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Combobox } from '@/components/ui/combobox';

const vehicleSchema = z
  .object({
    category: z.string().min(1, 'Category is required'),
    brand: z.string().optional(),
    model: z.string().optional(),
    regNumber: z.string().optional()
  })
  .refine(
    (data) => {
      // If category is Custom/Special, model becomes required
      if (data.category === 'Custom/Special' && !data.model) {
        return false;
      }
      return true;
    },
    {
      message: 'Custom vehicle name is required for Custom/Special category',
      path: ['model']
    }
  );

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface VehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  supplierId: string;
  vehicle?: {
    id: string;
    category: string;
    brand?: string | null;
    model?: string | null;
    regNumber?: string | null;
  } | null;
}

interface MasterCategory {
  id: string;
  name: string;
  isCustom: boolean;
  sortOrder: number;
}

interface MasterBrand {
  id: string;
  name: string;
  isPopular: boolean;
  sortOrder: number;
}

export function VehicleDialog({
  open,
  onOpenChange,
  onSuccess,
  supplierId,
  vehicle
}: VehicleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [brands, setBrands] = useState<MasterBrand[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const isEditing = !!vehicle;

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      category: vehicle?.category || '',
      brand: vehicle?.brand || '',
      model: vehicle?.model || '',
      regNumber: vehicle?.regNumber || ''
    }
  });

  const selectedCategory = form.watch('category');
  const isCustomCategory = selectedCategory === 'Custom/Special';

  // Fetch master categories and brands when dialog opens
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setLoadingData(true);
        try {
          const [categoriesRes, brandsRes] = await Promise.all([
            fetch('/api/vehicle-categories'),
            fetch('/api/vehicle-brands')
          ]);

          if (categoriesRes.ok) {
            const data = await categoriesRes.json();
            setCategories(data.categories || []);
          }

          if (brandsRes.ok) {
            const data = await brandsRes.json();
            setBrands(data.brands || []);
          }
        } catch (error) {
          console.error('Failed to fetch master data:', error);
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    }
  }, [open]);

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
            name='category'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle Category *</FormLabel>
                <FormControl>
                  <Combobox
                    items={categories.map((cat) => ({
                      value: cat.name,
                      label: cat.name
                    }))}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select category...'
                    searchPlaceholder='Search categories...'
                    emptyMessage='No categories found.'
                    disabled={loadingData}
                  />
                </FormControl>
                <FormDescription>
                  Choose vehicle category or select Custom/Special for unique
                  vehicles
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {!isCustomCategory && (
            <FormField
              control={form.control}
              name='brand'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Brand</FormLabel>
                  <FormControl>
                    <Combobox
                      items={brands.map((brand) => ({
                        value: brand.name,
                        label: brand.name
                      }))}
                      value={field.value || ''}
                      onValueChange={field.onChange}
                      placeholder='Select brand...'
                      searchPlaceholder='Search brands...'
                      emptyMessage='No brands found.'
                      disabled={loadingData}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional - Popular UAE brands shown first
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name='model'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {isCustomCategory ? 'Custom Vehicle Name *' : 'Model'}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      isCustomCategory
                        ? 'e.g., Presidential Limousine, Vintage 1960 Rolls Royce'
                        : 'e.g., Camry 2024, X5 M Sport'
                    }
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {isCustomCategory
                    ? 'Describe the special/custom vehicle'
                    : 'Optional - Specific model name/year'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='regNumber'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registration Number</FormLabel>
                <FormControl>
                  <Input placeholder='ABC123 (optional)' {...field} />
                </FormControl>
                <FormDescription>
                  Optional - Vehicle registration/plate number
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
