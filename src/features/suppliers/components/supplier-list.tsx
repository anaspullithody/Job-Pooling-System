'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Edit, Trash2 } from 'lucide-react';
import { TableSearch } from '@/components/ui/table-search';

interface Supplier {
  id: string;
  name: string;
  phone?: string | null;
  contacts: Array<{
    id: string;
    phone?: string | null;
    email?: string | null;
  }>;
  supplierCategories: Array<{
    id: string;
    category: string;
    vehicleCount: number;
  }>;
  supplierVehicles: Array<{
    id: string;
    category: string;
    regNumber: string;
    model?: string | null;
  }>;
}

export function SupplierList({ suppliers }: { suppliers: Supplier[] }) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');

  const filteredSuppliers = useMemo(() => {
    if (!searchValue.trim()) return suppliers;

    const search = searchValue.toLowerCase();
    return suppliers.filter((supplier) => {
      // Search in name
      if (supplier.name.toLowerCase().includes(search)) return true;

      // Search in phone
      if (supplier.phone?.toLowerCase().includes(search)) return true;

      // Search in contact phones and emails
      const contactMatch = supplier.contacts.some(
        (contact) =>
          contact.phone?.toLowerCase().includes(search) ||
          contact.email?.toLowerCase().includes(search)
      );
      if (contactMatch) return true;

      // Search in categories
      const categoryMatch = supplier.supplierCategories.some((cat) =>
        cat.category.toLowerCase().includes(search)
      );
      if (categoryMatch) return true;

      // Search in vehicle reg numbers and models
      const vehicleMatch = supplier.supplierVehicles.some(
        (vehicle) =>
          vehicle.regNumber?.toLowerCase().includes(search) ||
          vehicle.model?.toLowerCase().includes(search)
      );
      if (vehicleMatch) return true;

      return false;
    });
  }, [suppliers, searchValue]);

  return (
    <div className='space-y-4'>
      <TableSearch
        value={searchValue}
        onChange={setSearchValue}
        placeholder='Search suppliers by name, phone, contact info, or categories...'
        resultCount={filteredSuppliers.length}
        totalCount={suppliers.length}
      />

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Contacts</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Vehicles</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='h-24 text-center'>
                  {searchValue
                    ? 'No suppliers match your search.'
                    : 'No suppliers found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredSuppliers.map((supplier) => (
                <TableRow
                  key={supplier.id}
                  className='cursor-pointer'
                  onClick={() =>
                    router.push(`/dashboard/suppliers/${supplier.id}`)
                  }
                >
                  <TableCell className='font-medium'>{supplier.name}</TableCell>
                  <TableCell>{supplier.phone || '-'}</TableCell>
                  <TableCell>
                    {supplier.contacts.length > 0
                      ? supplier.contacts
                          .map((c) => c.email || c.phone)
                          .filter(Boolean)
                          .join(', ')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {supplier.supplierCategories.length > 0
                      ? supplier.supplierCategories
                          .map((c) => `${c.category} (${c.vehicleCount})`)
                          .join(', ')
                      : '-'}
                  </TableCell>
                  <TableCell>{supplier.supplierVehicles.length}</TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/suppliers/${supplier.id}`);
                        }}
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (
                            confirm(
                              `Are you sure you want to delete ${supplier.name}?`
                            )
                          ) {
                            // Handle delete
                            const response = await fetch(
                              `/api/suppliers/${supplier.id}`,
                              { method: 'DELETE' }
                            );
                            if (response.ok) {
                              router.refresh();
                            }
                          }
                        }}
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
      </div>
    </div>
  );
}
