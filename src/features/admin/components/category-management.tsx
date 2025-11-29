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
import { Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { TableSearch } from '@/components/ui/table-search';
import { CategoryDialog } from './category-dialog';

interface VehicleCategory {
  id: string;
  name: string;
  isCustom: boolean;
  description?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<VehicleCategory | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/vehicle-categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleDelete = async (category: VehicleCategory) => {
    if (!category.isCustom) {
      toast.error('Cannot delete system categories');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/vehicle-categories/${category.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete category');
      }

      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (category: VehicleCategory) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setDialogOpen(true);
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <TableSearch
          value={searchValue}
          onChange={setSearchValue}
          placeholder='Search categories...'
          resultCount={filteredCategories.length}
          totalCount={categories.length}
          className='max-w-sm flex-1'
        />
        <Button onClick={handleAdd}>
          <Plus className='mr-2 h-4 w-4' />
          Add Category
        </Button>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Sort Order</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className='h-24 text-center'>
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='h-24 text-center'>
                  {searchValue
                    ? 'No categories match your search.'
                    : 'No categories found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className='font-medium'>{category.name}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        category.isCustom
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {category.isCustom ? 'Custom' : 'System'}
                    </span>
                  </TableCell>
                  <TableCell>{category.description || '-'}</TableCell>
                  <TableCell>{category.sortOrder}</TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleEdit(category)}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      {category.isCustom && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDelete(category)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={selectedCategory}
        onSuccess={fetchCategories}
      />
    </div>
  );
}
