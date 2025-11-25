'use client';

import { useState } from 'react';
import { useCancelOrder } from '@/lib/hooks/use-orders';
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
import { X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface CancelOrderDialogProps {
  orderId: string;
  orderNumber: string;
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  buttonClassName?: string;
}

export function CancelOrderDialog({ orderId, orderNumber, buttonSize = 'default', buttonClassName }: CancelOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const cancelOrder = useCancelOrder();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!cancellationReason.trim()) {
      toast({
        title: 'Error',
        description: 'Debe proporcionar una razón de cancelación',
        variant: 'destructive',
      });
      return;
    }

    try {
      await cancelOrder.mutateAsync({
        orderId,
        cancellation_reason: cancellationReason,
      });
      toast({
        title: 'Orden cancelada',
        description: `La orden ${orderNumber} ha sido cancelada exitosamente.`,
      });
      setOpen(false);
      setCancellationReason('');
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Hubo un error al cancelar la orden.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size={buttonSize} className={buttonClassName}>
          <X className="h-4 w-4 mr-2" />
          Cancelar Orden
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar Orden</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres cancelar la orden {orderNumber}? Esta acción cambiará el
            estado de la orden a CANCELLED.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cancellation_reason">Razón de Cancelación *</Label>
            <textarea
              id="cancellation_reason"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              disabled={cancelOrder.isPending}
              placeholder="Explica por qué se cancela la orden..."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              No Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmit}
              disabled={cancelOrder.isPending || !cancellationReason.trim()}
            >
              {cancelOrder.isPending ? 'Cancelando...' : 'Confirmar Cancelación'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

