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

const categorySchema = z.object({
  category: z.string().min(1, 'Category name is required'),
  vehicleCount: z.number().int().min(0).optional()
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  supplierId: string;
  category?: {
    id: string;
    category: string;
    vehicleCount?: number;
  } | null;
}

export function CategoryDialog({
  open,
  onOpenChange,
  onSuccess,
  supplierId,
  category
}: CategoryDialogProps) {
  const [loading, setLoading] = useState(false);
  const [masterCategories, setMasterCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const isEditing = !!category;

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      category: category?.category || '',
      vehicleCount: category?.vehicleCount || 0
    }
  });

  // Fetch master categories when dialog opens
  useEffect(() => {
    if (open) {
      const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
          const res = await fetch('/api/vehicle-categories');
          if (res.ok) {
            const data = await res.json();
            setMasterCategories(data.categories || []);
          }
        } catch (error) {
          console.error('Failed to fetch categories:', error);
        } finally {
          setLoadingCategories(false);
        }
      };
      fetchCategories();

      // Reset form when opening
      form.reset({
        category: category?.category || '',
        vehicleCount: category?.vehicleCount || 0
      });
    }
  }, [open, category, form]);

  const onSubmit = async (data: CategoryFormData) => {
    setLoading(true);
    try {
      const url = isEditing
        ? `/api/suppliers/${supplierId}/categories/${category.id}`
        : `/api/suppliers/${supplierId}/categories`;
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
        throw new Error(error.error || 'Failed to save category');
      }

      toast.success(
        isEditing
          ? 'Category updated successfully'
          : 'Category created successfully'
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
            {isEditing ? 'Edit Category' : 'Add New Category'}
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
                <FormLabel>Category Name *</FormLabel>
                <FormControl>
                  <Combobox
                    items={masterCategories.map((cat) => ({
                      value: cat.name,
                      label: cat.name
                    }))}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select category...'
                    searchPlaceholder='Search categories...'
                    emptyMessage='No categories found.'
                    disabled={loadingCategories || isEditing}
                  />
                </FormControl>
                <FormDescription>
                  {isEditing
                    ? 'Category cannot be changed after creation'
                    : 'Select from master vehicle categories'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='vehicleCount'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle Count</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='0'
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                  />
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
                'Save Category'
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
