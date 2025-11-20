'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRefund } from '@/lib/hooks/use-payments';
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
import { RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils/currency';

const refundSchema = z.object({
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0').optional(),
  reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).optional(),
});

type RefundFormData = z.infer<typeof refundSchema>;

interface RefundDialogProps {
  transactionId: string;
  transactionAmount: number;
  currency: string;
  orderId: string;
}

export function RefundDialog({
  transactionId,
  transactionAmount,
  currency,
  orderId,
}: RefundDialogProps) {
  const [open, setOpen] = useState(false);
  const refund = useRefund();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RefundFormData>({
    resolver: zodResolver(refundSchema),
    defaultValues: {
      amount: transactionAmount,
    },
  });

  const refundAmount = watch('amount') || transactionAmount;

  const onSubmit = async (data: RefundFormData) => {
    try {
      await refund.mutateAsync({
        payment_transaction_id: transactionId,
        amount: data.amount,
        reason: data.reason,
      });
      toast({
        title: 'Reembolso procesado',
        description: `Reembolso de ${formatCurrency(data.amount || transactionAmount, currency)} procesado exitosamente.`,
      });
      setOpen(false);
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Hubo un error al procesar el reembolso.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reembolsar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Procesar Reembolso</DialogTitle>
          <DialogDescription>
            Procesa un reembolso para esta transacción. El reembolso se procesará a través de Stripe
            si la transacción original fue procesada con tarjeta.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transaction_info">Transacción</Label>
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm">
                Monto original: <span className="font-medium">{formatCurrency(transactionAmount, currency)}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">Orden: {orderId.substring(0, 8)}...</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              Monto a Reembolsar (Opcional)
              <span className="text-xs text-muted-foreground ml-2">
                (Dejar vacío para reembolsar el total)
              </span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max={transactionAmount}
              {...register('amount', { valueAsNumber: true })}
              disabled={refund.isPending}
              placeholder={transactionAmount.toString()}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
            {refundAmount && refundAmount <= transactionAmount && (
              <p className="text-xs text-muted-foreground">
                Reembolso: {formatCurrency(refundAmount, currency)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Razón del Reembolso (Opcional)</Label>
            <select
              id="reason"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...register('reason')}
              disabled={refund.isPending}
            >
              <option value="">Selecciona una razón</option>
              <option value="requested_by_customer">Solicitado por el cliente</option>
              <option value="duplicate">Pago duplicado</option>
              <option value="fraudulent">Fraudulento</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={refund.isPending}>
              {refund.isPending ? 'Procesando...' : 'Procesar Reembolso'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

