'use client';

import { useState } from 'react';
import { useDrivers } from '@/lib/hooks/use-drivers';
import { useAssignDriver } from '@/lib/hooks/use-orders';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Truck } from 'lucide-react';

interface AssignDriverDialogProps {
  orderId: string;
}

export function AssignDriverDialog({ orderId }: AssignDriverDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const { data: drivers } = useDrivers();
  const assignDriver = useAssignDriver();

  const handleSubmit = async () => {
    if (!selectedDriverId) return;

    try {
      await assignDriver.mutateAsync({
        orderId,
        driverId: selectedDriverId,
      });
      setOpen(false);
      setSelectedDriverId('');
    } catch (error) {
      console.error('Error assigning driver:', error);
    }
  };

  const availableDrivers = drivers?.filter(
    (driver) => driver.availability_status === 'AVAILABLE' || driver.availability_status === 'BUSY'
  ) || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Truck className="h-4 w-4 mr-2" />
          Asignar Driver
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar Driver</DialogTitle>
          <DialogDescription>
            Selecciona un driver para asignar a esta orden. Esta acción sigue el patrón inmutable
            (crea un nuevo registro).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="driver">Driver</Label>
            <select
              id="driver"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              disabled={assignDriver.isPending}
            >
              <option value="">Selecciona un driver</option>
              {availableDrivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.user?.first_name || 'N/A'} {driver.user?.last_name || ''} - {driver.user?.email || driver.driving_license}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!selectedDriverId || assignDriver.isPending}>
              {assignDriver.isPending ? 'Asignando...' : 'Asignar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

