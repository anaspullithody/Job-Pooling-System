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

interface Client {
  id: string;
  name: string;
  phone?: string | null;
  contacts: Array<{
    id: string;
    phone?: string | null;
    email?: string | null;
  }>;
  clientJobs: Array<{
    id: string;
    status: string;
    createdAt: string;
  }>;
}

interface ClientListProps {
  clients: Client[];
  canEdit?: boolean;
}

export function ClientList({ clients, canEdit = true }: ClientListProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');

  const filteredClients = useMemo(() => {
    if (!searchValue.trim()) return clients;

    const search = searchValue.toLowerCase();
    return clients.filter((client) => {
      // Search in name
      if (client.name.toLowerCase().includes(search)) return true;

      // Search in phone
      if (client.phone?.toLowerCase().includes(search)) return true;

      // Search in contact phones and emails
      const contactMatch = client.contacts.some(
        (contact) =>
          contact.phone?.toLowerCase().includes(search) ||
          contact.email?.toLowerCase().includes(search)
      );
      if (contactMatch) return true;

      return false;
    });
  }, [clients, searchValue]);

  return (
    <div className='space-y-4'>
      <TableSearch
        value={searchValue}
        onChange={setSearchValue}
        placeholder='Search clients by name, phone, or contact info...'
        resultCount={filteredClients.length}
        totalCount={clients.length}
      />

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Contacts</TableHead>
              <TableHead>Recent Jobs</TableHead>
              {canEdit && <TableHead className='text-right'>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canEdit ? 5 : 4}
                  className='h-24 text-center'
                >
                  {searchValue
                    ? 'No clients match your search.'
                    : 'No clients found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow
                  key={client.id}
                  className='cursor-pointer'
                  onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                >
                  <TableCell className='font-medium'>{client.name}</TableCell>
                  <TableCell>{client.phone || '-'}</TableCell>
                  <TableCell>
                    {client.contacts.length > 0
                      ? client.contacts
                          .map((c) => c.email || c.phone)
                          .filter(Boolean)
                          .join(', ')
                      : '-'}
                  </TableCell>
                  <TableCell>{client.clientJobs.length}</TableCell>
                  {canEdit && (
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/clients/${client.id}`);
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
                                `Are you sure you want to delete ${client.name}?`
                              )
                            ) {
                              const response = await fetch(
                                `/api/clients/${client.id}`,
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
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
