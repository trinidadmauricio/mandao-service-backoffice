'use client';

import { useState } from 'react';
import { useBranches } from '@/lib/hooks/use-branches';
import { useChangeBranch, useOrder } from '@/lib/hooks/use-orders';
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
import { useToast } from '@/components/ui/use-toast';
import { MapPin } from 'lucide-react';

interface ChangeBranchDialogProps {
  orderId: string;
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  buttonClassName?: string;
  hasBranch?: boolean;
}

export function ChangeBranchDialog({ orderId, buttonSize = 'default', buttonClassName, hasBranch = false }: ChangeBranchDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const { data: branches } = useBranches();
  const changeBranch = useChangeBranch();
  const { data: order } = useOrder(orderId);
  const { toast } = useToast();

  // Validación defensiva: verificar que la orden no sea ON_DEMAND
  const isOnDemand = order?.order_type === 'ON_DEMAND';

  const handleSubmit = async () => {
    if (!selectedBranchId) return;

    // Validación defensiva
    if (isOnDemand) {
      toast({
        title: 'Error',
        description: 'Las órdenes ON_DEMAND no pueden tener sucursales asignadas',
        variant: 'destructive',
      });
      return;
    }

    try {
      await changeBranch.mutateAsync({
        orderId,
        branchId: selectedBranchId,
      });
      toast({
        title: 'Sucursal actualizada',
        description: hasBranch ? 'La sucursal ha sido cambiada exitosamente.' : 'La sucursal ha sido asignada exitosamente.',
      });
      setOpen(false);
      setSelectedBranchId('');
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error al cambiar la sucursal. Por favor, intenta nuevamente.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const activeBranches = branches?.filter((branch) => branch.status === 'ACTIVE') || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size={buttonSize} className={buttonClassName}>
          <MapPin className="h-4 w-4 mr-2" />
          {hasBranch ? 'Cambiar Sucursal' : 'Asignar Sucursal'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{hasBranch ? 'Cambiar Sucursal' : 'Asignar Sucursal'}</DialogTitle>
          <DialogDescription>
            {hasBranch
              ? 'Selecciona una nueva sucursal para esta orden. Esta acción sigue el patrón inmutable (crea un nuevo registro).'
              : 'Selecciona una sucursal para asignar a esta orden.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="branch">Sucursal</Label>
            <select
              id="branch"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              disabled={changeBranch.isPending}
            >
              <option value="">Selecciona una sucursal</option>
              {activeBranches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!selectedBranchId || changeBranch.isPending}>
              {changeBranch.isPending ? 'Cambiando...' : 'Cambiar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

