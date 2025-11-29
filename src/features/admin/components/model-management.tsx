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
import { ModelDialog } from './model-dialog';

interface VehicleModel {
  id: string;
  name: string;
  brandName: string;
  category?: string | null;
  isPopular: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export function ModelManagement() {
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/vehicle-models');
      if (res.ok) {
        const data = await res.json();
        setModels(data.models || []);
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
      toast.error('Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const filteredModels = models.filter(
    (model) =>
      model.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      model.brandName.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleDelete = async (model: VehicleModel) => {
    if (!confirm(`Are you sure you want to delete "${model.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/vehicle-models/${model.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete model');
      }

      toast.success('Model deleted successfully');
      fetchModels();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const togglePopular = async (model: VehicleModel) => {
    try {
      const res = await fetch(`/api/vehicle-models/${model.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isPopular: !model.isPopular })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update model');
      }

      toast.success(
        model.isPopular
          ? 'Removed from popular models'
          : 'Marked as popular model'
      );
      fetchModels();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (model: VehicleModel) => {
    setSelectedModel(model);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedModel(null);
    setDialogOpen(true);
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <TableSearch
          value={searchValue}
          onChange={setSearchValue}
          placeholder='Search models...'
          resultCount={filteredModels.length}
          totalCount={models.length}
          className='max-w-sm flex-1'
        />
        <Button onClick={handleAdd}>
          <Plus className='mr-2 h-4 w-4' />
          Add Model
        </Button>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Model Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Popular</TableHead>
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
            ) : filteredModels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='h-24 text-center'>
                  {searchValue
                    ? 'No models match your search.'
                    : 'No models found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredModels.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className='font-medium'>{model.name}</TableCell>
                  <TableCell>{model.brandName}</TableCell>
                  <TableCell>{model.category || '-'}</TableCell>
                  <TableCell>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => togglePopular(model)}
                      className='h-8 w-8 p-0'
                    >
                      <Star
                        className={`h-4 w-4 ${
                          model.isPopular
                            ? 'fill-yellow-400 text-yellow-400'
                            : ''
                        }`}
                      />
                    </Button>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleEdit(model)}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDelete(model)}
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

      <ModelDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        model={selectedModel}
        onSuccess={fetchModels}
      />
    </div>
  );
}
