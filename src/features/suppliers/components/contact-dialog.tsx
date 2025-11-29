'use client';

import { useState } from 'react';
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
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const contactSchema = z
  .object({
    phone: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal(''))
  })
  .refine((data) => data.phone || data.email, {
    message: 'At least one contact method is required',
    path: ['phone']
  });

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  supplierId: string;
  contact?: {
    id: string;
    phone?: string | null;
    email?: string | null;
  } | null;
}

export function ContactDialog({
  open,
  onOpenChange,
  onSuccess,
  supplierId,
  contact
}: ContactDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!contact;

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      phone: contact?.phone || '',
      email: contact?.email || ''
    }
  });

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    try {
      const url = isEditing
        ? `/api/suppliers/${supplierId}/contacts/${contact.id}`
        : `/api/suppliers/${supplierId}/contacts`;
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
        throw new Error(error.error || 'Failed to save contact');
      }

      toast.success(
        isEditing
          ? 'Contact updated successfully'
          : 'Contact created successfully'
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
            {isEditing ? 'Edit Contact' : 'Add New Contact'}
          </DialogTitle>
        </DialogHeader>

        <Form
          form={form}
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-4'
        >
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

          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder='contact@company.com' {...field} />
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
                'Save Contact'
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
