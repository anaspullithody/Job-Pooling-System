'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supplierId = params.id as string;

  const [supplier, setSupplier] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supplierRes, contactsRes, categoriesRes, vehiclesRes] =
          await Promise.all([
            fetch(`/api/suppliers/${supplierId}`),
            fetch(`/api/suppliers/${supplierId}/contacts`),
            fetch(`/api/suppliers/${supplierId}/categories`),
            fetch(`/api/suppliers/${supplierId}/vehicles`)
          ]);

        if (supplierRes.ok) {
          const data = await supplierRes.json();
          setSupplier(data.supplier);
        }
        if (contactsRes.ok) {
          const data = await contactsRes.json();
          setContacts(data.contacts);
        }
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.categories);
        }
        if (vehiclesRes.ok) {
          const data = await vehiclesRes.json();
          setVehicles(data.vehicles);
        }
      } catch (error) {
        toast.error('Failed to load supplier details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supplierId]);

  if (loading) {
    return <div className='flex-1 p-8'>Loading...</div>;
  }

  if (!supplier) {
    return <div className='flex-1 p-8'>Supplier not found</div>;
  }

  return (
    <div className='flex-1 space-y-4 p-4 pt-6 md:p-8'>
      <div className='flex items-center gap-4'>
        <Button variant='outline' size='sm' onClick={() => router.back()}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back
        </Button>
        <h2 className='text-3xl font-bold tracking-tight'>{supplier.name}</h2>
      </div>

      <Tabs defaultValue='info' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='info'>Basic Info</TabsTrigger>
          <TabsTrigger value='contacts'>
            Contacts ({contacts.length})
          </TabsTrigger>
          <TabsTrigger value='categories'>
            Categories ({categories.length})
          </TabsTrigger>
          <TabsTrigger value='vehicles'>
            Vehicles ({vehicles.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value='info'>
          <Card>
            <CardHeader>
              <CardTitle>Supplier Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div>
                <span className='font-semibold'>Name:</span> {supplier.name}
              </div>
              <div>
                <span className='font-semibold'>Phone:</span>{' '}
                {supplier.phone || 'N/A'}
              </div>
              <div>
                <span className='font-semibold'>Type:</span> {supplier.kind}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='contacts'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>Contacts</CardTitle>
              <Button size='sm'>
                <Plus className='mr-2 h-4 w-4' />
                Add Contact
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className='text-muted-foreground text-center'
                      >
                        No contacts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>{contact.phone || 'N/A'}</TableCell>
                        <TableCell>{contact.email || 'N/A'}</TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-2'>
                            <Button variant='ghost' size='sm'>
                              <Pencil className='h-4 w-4' />
                            </Button>
                            <Button variant='ghost' size='sm'>
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='categories'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>Categories</CardTitle>
              <Button size='sm'>
                <Plus className='mr-2 h-4 w-4' />
                Add Category
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Vehicle Count</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className='text-muted-foreground text-center'
                      >
                        No categories found
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>{category.category}</TableCell>
                        <TableCell>{category._count?.vehicles || 0}</TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-2'>
                            <Button variant='ghost' size='sm'>
                              <Pencil className='h-4 w-4' />
                            </Button>
                            <Button variant='ghost' size='sm'>
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='vehicles'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>Vehicles</CardTitle>
              <Button size='sm'>
                <Plus className='mr-2 h-4 w-4' />
                Add Vehicle
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Registration</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className='text-muted-foreground text-center'
                      >
                        No vehicles found
                      </TableCell>
                    </TableRow>
                  ) : (
                    vehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>{vehicle.regNumber}</TableCell>
                        <TableCell>{vehicle.model || 'N/A'}</TableCell>
                        <TableCell>
                          {vehicle.category?.category || 'N/A'}
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-2'>
                            <Button variant='ghost' size='sm'>
                              <Pencil className='h-4 w-4' />
                            </Button>
                            <Button variant='ghost' size='sm'>
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
