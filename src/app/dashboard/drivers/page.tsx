'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DriverList } from '@/features/drivers/components/driver-list';
import { DriverFormDialog } from '@/features/drivers/components/driver-form-dialog';
import { ResetPinDialog } from '@/features/drivers/components/reset-pin-dialog';
import { toast } from 'sonner';

interface Driver {
  id: string;
  phone: string;
  name?: string | null;
  vehiclePlate?: string | null;
  pinTemp: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resetPinDialogOpen, setResetPinDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const fetchDrivers = async () => {
    try {
      const res = await fetch('/api/drivers');
      if (!res.ok) {
        throw new Error('Failed to fetch drivers');
      }
      const data = await res.json();
      setDrivers(data.drivers);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleEdit = (driver: Driver) => {
    setSelectedDriver(driver);
    setDialogOpen(true);
  };

  const handleResetPin = (driver: Driver) => {
    setSelectedDriver(driver);
    setResetPinDialogOpen(true);
  };

  const handleDelete = (driverId: string) => {
    setDrivers(drivers.filter((d) => d.id !== driverId));
  };

  const handleSuccess = () => {
    fetchDrivers();
    setSelectedDriver(null);
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedDriver(null);
    }
  };

  const handleResetPinOpenChange = (open: boolean) => {
    setResetPinDialogOpen(open);
    if (!open) {
      setSelectedDriver(null);
    }
  };

  return (
    <div className='flex-1 space-y-4 p-4 pt-6 md:p-8'>
      <div className='flex items-center justify-between'>
        <h2 className='text-3xl font-bold tracking-tight'>Driver Management</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Create Driver
        </Button>
      </div>

      <div className='text-muted-foreground text-sm'>
        Manage driver accounts, PIN status, and access. Drivers with temporary
        PINs must change them on first login.
      </div>

      {loading ? (
        <div className='py-8 text-center'>Loading drivers...</div>
      ) : (
        <DriverList
          drivers={drivers}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onResetPin={handleResetPin}
        />
      )}

      <DriverFormDialog
        open={dialogOpen}
        onOpenChange={handleOpenChange}
        onSuccess={handleSuccess}
        driver={selectedDriver}
      />

      <ResetPinDialog
        open={resetPinDialogOpen}
        onOpenChange={handleResetPinOpenChange}
        onSuccess={handleSuccess}
        driver={selectedDriver}
      />
    </div>
  );
}
