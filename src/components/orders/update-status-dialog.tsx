'use client';

import { useState } from 'react';
import { useUpdateOrderStatus } from '@/lib/hooks/use-orders';
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
import { Input } from '@/components/ui/input';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { Order } from '@/types/api';

interface UpdateStatusDialogProps {
  orderId: string;
  currentStatus: Order['status'];
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  buttonClassName?: string;
}

export function UpdateStatusDialog({ orderId, currentStatus, buttonSize = 'default', buttonClassName }: UpdateStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const [toStatus, setToStatus] = useState<Order['status']>(currentStatus);
  const [notes, setNotes] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const updateStatus = useUpdateOrderStatus();
  const { toast } = useToast();

  const statusOptions: Array<{ value: Order['status']; label: string }> = [
    { value: 'DRAFT', label: 'Borrador' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'CONFIRMED', label: 'Confirmada' },
    { value: 'ASSIGNED', label: 'Asignada' },
    { value: 'IN_TRANSIT', label: 'En Tránsito' },
    { value: 'DELIVERED', label: 'Entregada' },
    { value: 'CANCELLED', label: 'Cancelada' },
    { value: 'FAILED', label: 'Fallida' },
  ];

  const handleSubmit = async () => {
    if (toStatus === currentStatus) {
      toast({
        title: 'Error',
        description: 'Debe seleccionar un estado diferente al actual',
        variant: 'destructive',
      });
      return;
    }

    if (toStatus === 'CANCELLED' && !cancellationReason) {
      toast({
        title: 'Error',
        description: 'Debe proporcionar una razón de cancelación',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateStatus.mutateAsync({
        id: orderId,
        to_status: toStatus,
        notes: notes || undefined,
        cancellation_reason: toStatus === 'CANCELLED' ? cancellationReason : undefined,
      });
      toast({
        title: 'Estado actualizado',
        description: 'El estado de la orden ha sido actualizado exitosamente.',
      });
      setOpen(false);
      setNotes('');
      setCancellationReason('');
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Hubo un error al actualizar el estado.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size={buttonSize} className={buttonClassName}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar Estado
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualizar Estado</DialogTitle>
          <DialogDescription>
            Cambia el estado de la orden. El sistema validará las transiciones permitidas.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_status">Estado Actual</Label>
            <Input id="current_status" value={currentStatus} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to_status">Nuevo Estado *</Label>
            <select
              id="to_status"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={toStatus}
              onChange={(e) => setToStatus(e.target.value as Order['status'])}
              disabled={updateStatus.isPending}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {toStatus === 'CANCELLED' && (
            <div className="space-y-2">
              <Label htmlFor="cancellation_reason">Razón de Cancelación *</Label>
              <textarea
                id="cancellation_reason"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                disabled={updateStatus.isPending}
                placeholder="Explica por qué se cancela la orden..."
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (Opcional)</Label>
            <textarea
              id="notes"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={updateStatus.isPending}
              placeholder="Notas adicionales sobre el cambio de estado..."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                updateStatus.isPending ||
                toStatus === currentStatus ||
                (toStatus === 'CANCELLED' && !cancellationReason)
              }
            >
              {updateStatus.isPending ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


