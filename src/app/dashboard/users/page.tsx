'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { UserList } from '@/features/users/components/user-list';
import { UserFormDialog } from '@/features/users/components/user-form-dialog';
import { toast } from 'sonner';
import { UserRole } from '@/types/user';

interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await res.json();
      setUsers(data.users);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleDelete = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId));
  };

  const handleSuccess = () => {
    fetchUsers();
    setSelectedUser(null);
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedUser(null);
    }
  };

  return (
    <div className='flex-1 space-y-4 p-4 pt-6 md:p-8'>
      <div className='flex items-center justify-between'>
        <h2 className='text-3xl font-bold tracking-tight'>User Management</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Create User
        </Button>
      </div>

      <div className='text-muted-foreground text-sm'>
        Manage SUPER_ADMIN and ACCOUNTANT users. Drivers are managed separately.
      </div>

      {loading ? (
        <div className='py-8 text-center'>Loading users...</div>
      ) : (
        <UserList users={users} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <UserFormDialog
        open={dialogOpen}
        onOpenChange={handleOpenChange}
        onSuccess={handleSuccess}
        user={selectedUser}
      />
    </div>
  );
}
