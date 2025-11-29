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
import { ContactDialog } from '@/features/suppliers/components/contact-dialog';
import { CategoryDialog } from '@/features/suppliers/components/category-dialog';
import { VehicleDialog } from '@/features/suppliers/components/vehicle-dialog';

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supplierId = params.id as string;

  const [supplier, setSupplier] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

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

  useEffect(() => {
    fetchData();
  }, [supplierId]);

  // Delete handlers
  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const res = await fetch(
        `/api/suppliers/${supplierId}/contacts/${contactId}`,
        {
          method: 'DELETE'
        }
      );
      if (res.ok) {
        toast.success('Contact deleted successfully');
        fetchData();
      } else {
        throw new Error('Failed to delete contact');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete contact');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this category? All vehicles in this category will also be deleted.'
      )
    )
      return;

    try {
      const res = await fetch(
        `/api/suppliers/${supplierId}/categories/${categoryId}`,
        {
          method: 'DELETE'
        }
      );
      if (res.ok) {
        toast.success('Category deleted successfully');
        fetchData();
      } else {
        throw new Error('Failed to delete category');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete category');
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const res = await fetch(
        `/api/suppliers/${supplierId}/vehicles/${vehicleId}`,
        {
          method: 'DELETE'
        }
      );
      if (res.ok) {
        toast.success('Vehicle deleted successfully');
        fetchData();
      } else {
        throw new Error('Failed to delete vehicle');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete vehicle');
    }
  };

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
              <Button
                size='sm'
                onClick={() => {
                  setSelectedContact(null);
                  setContactDialogOpen(true);
                }}
              >
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
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setSelectedContact(contact);
                                setContactDialogOpen(true);
                              }}
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleDeleteContact(contact.id)}
                            >
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
              <Button
                size='sm'
                onClick={() => {
                  setSelectedCategory(null);
                  setCategoryDialogOpen(true);
                }}
              >
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
                        <TableCell>{category.vehicleCount || 0}</TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setSelectedCategory(category);
                                setCategoryDialogOpen(true);
                              }}
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleDeleteCategory(category.id)}
                            >
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
              <Button
                size='sm'
                onClick={() => {
                  setSelectedVehicle(null);
                  setVehicleDialogOpen(true);
                }}
              >
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
                        <TableCell>{vehicle.category}</TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setSelectedVehicle(vehicle);
                                setVehicleDialogOpen(true);
                              }}
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleDeleteVehicle(vehicle.id)}
                            >
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

      {/* Dialogs */}
      <ContactDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        onSuccess={fetchData}
        supplierId={supplierId}
        contact={selectedContact}
      />

      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onSuccess={fetchData}
        supplierId={supplierId}
        category={selectedCategory}
      />

      <VehicleDialog
        open={vehicleDialogOpen}
        onOpenChange={setVehicleDialogOpen}
        onSuccess={fetchData}
        supplierId={supplierId}
        vehicle={selectedVehicle}
      />
    </div>
  );
}
