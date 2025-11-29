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
import { Combobox } from '@/components/ui/combobox';

const modelSchema = z.object({
  name: z.string().min(1, 'Model name is required'),
  brandName: z.string().min(1, 'Brand is required'),
  category: z.string().optional(),
  isPopular: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional()
});

type ModelFormData = z.infer<typeof modelSchema>;

interface ModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  model?: {
    id: string;
    name: string;
    brandName: string;
    category?: string | null;
    isPopular: boolean;
    sortOrder: number;
  } | null;
  onSuccess: () => void;
}

export function ModelDialog({
  open,
  onOpenChange,
  model,
  onSuccess
}: ModelDialogProps) {
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [loadingData, setLoadingData] = useState(false);
  const isEditing = !!model;

  const form = useForm<ModelFormData>({
    resolver: zodResolver(modelSchema),
    defaultValues: {
      name: model?.name || '',
      brandName: model?.brandName || '',
      category: model?.category || '',
      isPopular: model?.isPopular || false,
      sortOrder: model?.sortOrder || 50
    }
  });

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setLoadingData(true);
        try {
          const [brandsRes, categoriesRes] = await Promise.all([
            fetch('/api/vehicle-brands'),
            fetch('/api/vehicle-categories')
          ]);

          if (brandsRes.ok) {
            const data = await brandsRes.json();
            setBrands(data.brands || []);
          }

          if (categoriesRes.ok) {
            const data = await categoriesRes.json();
            setCategories(data.categories || []);
          }
        } catch (error) {
          console.error('Failed to fetch data:', error);
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();

      form.reset({
        name: model?.name || '',
        brandName: model?.brandName || '',
        category: model?.category || '',
        isPopular: model?.isPopular || false,
        sortOrder: model?.sortOrder || 50
      });
    }
  }, [open, model, form]);

  const onSubmit = async (data: ModelFormData) => {
    setLoading(true);
    try {
      const url = isEditing
        ? `/api/vehicle-models/${model.id}`
        : '/api/vehicle-models';
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
        throw new Error(error.error || 'Failed to save model');
      }

      toast.success(
        isEditing ? 'Model updated successfully' : 'Model created successfully'
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
            {isEditing ? 'Edit Model' : 'Add New Model'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update vehicle model details.'
              : 'Add a new vehicle model to the system.'}
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
                <FormLabel>Model Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder='e.g., Camry, X5, Land Cruiser'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='brandName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand *</FormLabel>
                <FormControl>
                  <Combobox
                    items={brands.map((brand) => ({
                      value: brand.name,
                      label: brand.name
                    }))}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select brand...'
                    searchPlaceholder='Search brands...'
                    emptyMessage='No brands found.'
                    disabled={loadingData}
                  />
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
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Combobox
                    items={categories.map((cat) => ({
                      value: cat.name,
                      label: cat.name
                    }))}
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    placeholder='Select category...'
                    searchPlaceholder='Search categories...'
                    emptyMessage='No categories found.'
                    disabled={loadingData}
                  />
                </FormControl>
                <FormDescription>
                  Optional category hint for filtering
                </FormDescription>
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
                  <FormLabel>Popular Model</FormLabel>
                  <FormDescription>
                    Popular models appear first in dropdown lists
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
                'Update Model'
              ) : (
                'Add Model'
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
