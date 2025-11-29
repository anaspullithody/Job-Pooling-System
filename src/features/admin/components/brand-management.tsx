'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus, Star } from 'lucide-react';
import { toast } from 'sonner';
import { TableSearch } from '@/components/ui/table-search';
import { BrandDialog } from './brand-dialog';

interface VehicleBrand {
  id: string;
  name: string;
  isPopular: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export function BrandManagement() {
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<VehicleBrand | null>(null);

  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/vehicle-brands');
      if (res.ok) {
        const data = await res.json();
        setBrands(data.brands || []);
      }
    } catch (error) {
      console.error('Failed to fetch brands:', error);
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleDelete = async (brand: VehicleBrand) => {
    if (!confirm(`Are you sure you want to delete "${brand.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/vehicle-brands/${brand.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete brand');
      }

      toast.success('Brand deleted successfully');
      fetchBrands();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const togglePopular = async (brand: VehicleBrand) => {
    try {
      const res = await fetch(`/api/vehicle-brands/${brand.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isPopular: !brand.isPopular })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update brand');
      }

      toast.success(
        brand.isPopular
          ? 'Removed from popular brands'
          : 'Marked as popular brand'
      );
      fetchBrands();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (brand: VehicleBrand) => {
    setSelectedBrand(brand);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedBrand(null);
    setDialogOpen(true);
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <TableSearch
          value={searchValue}
          onChange={setSearchValue}
          placeholder='Search brands...'
          resultCount={filteredBrands.length}
          totalCount={brands.length}
          className='max-w-sm flex-1'
        />
        <Button onClick={handleAdd}>
          <Plus className='mr-2 h-4 w-4' />
          Add Brand
        </Button>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Popular</TableHead>
              <TableHead>Sort Order</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className='h-24 text-center'>
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredBrands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className='h-24 text-center'>
                  {searchValue
                    ? 'No brands match your search.'
                    : 'No brands found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredBrands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className='font-medium'>{brand.name}</TableCell>
                  <TableCell>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => togglePopular(brand)}
                      className='h-8 w-8 p-0'
                    >
                      <Star
                        className={`h-4 w-4 ${
                          brand.isPopular
                            ? 'fill-yellow-400 text-yellow-400'
                            : ''
                        }`}
                      />
                    </Button>
                  </TableCell>
                  <TableCell>{brand.sortOrder}</TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleEdit(brand)}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDelete(brand)}
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

      <BrandDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        brand={selectedBrand}
        onSuccess={fetchBrands}
      />
    </div>
  );
}
