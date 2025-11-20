'use client';

import { useState } from 'react';
import { useBranches } from '@/lib/hooks/use-branches';
import { useChangeBranch } from '@/lib/hooks/use-orders';
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
import { MapPin } from 'lucide-react';

interface ChangeBranchDialogProps {
  orderId: string;
}

export function ChangeBranchDialog({ orderId }: ChangeBranchDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const { data: branches } = useBranches();
  const changeBranch = useChangeBranch();

  const handleSubmit = async () => {
    if (!selectedBranchId) return;

    try {
      await changeBranch.mutateAsync({
        orderId,
        branchId: selectedBranchId,
      });
      setOpen(false);
      setSelectedBranchId('');
    } catch (error) {
      console.error('Error changing branch:', error);
    }
  };

  const activeBranches = branches?.filter((branch) => branch.status === 'ACTIVE') || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <MapPin className="h-4 w-4 mr-2" />
          Cambiar Branch
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar Branch</DialogTitle>
          <DialogDescription>
            Selecciona una nueva sucursal para esta orden. Esta acción sigue el patrón inmutable
            (crea un nuevo registro).
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

