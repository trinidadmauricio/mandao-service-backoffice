'use client';

import { useState } from 'react';
import { useRecalculateTotals } from '@/lib/hooks/use-orders';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calculator } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface RecalculateTotalsButtonProps {
  orderId: string;
}

export function RecalculateTotalsButton({ orderId, buttonSize = 'default', buttonClassName }: RecalculateTotalsButtonProps) {
  const [open, setOpen] = useState(false);
  const [taxRate, setTaxRate] = useState<number | undefined>();
  const [discountAmount, setDiscountAmount] = useState<number | undefined>();
  const recalculateTotals = useRecalculateTotals();
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      await recalculateTotals.mutateAsync({
        orderId,
        tax_rate: taxRate,
        discount_amount: discountAmount,
      });
      toast({
        title: 'Totales recalculados',
        description: 'Los totales de la orden han sido recalculados exitosamente.',
      });
      setOpen(false);
      setTaxRate(undefined);
      setDiscountAmount(undefined);
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Hubo un error al recalcular los totales.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size={buttonSize} className={buttonClassName}>
          <Calculator className="h-4 w-4 mr-2" />
          Recalcular Totales
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recalcular Totales</DialogTitle>
          <DialogDescription>
            Recalcula los totales de la orden. Puedes ajustar la tasa de impuesto y el descuento.
            Esta acción sigue el patrón inmutable (crea un nuevo registro).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tax_rate">Tasa de Impuesto (Opcional)</Label>
            <Input
              id="tax_rate"
              type="number"
              step="0.0001"
              min="0"
              max="1"
              value={taxRate || ''}
              onChange={(e) =>
                setTaxRate(e.target.value ? parseFloat(e.target.value) : undefined)
              }
              disabled={recalculateTotals.isPending}
              placeholder="0.16 (16%)"
            />
            <p className="text-xs text-muted-foreground">
              Deja vacío para usar la tasa actual de la orden
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount_amount">Monto de Descuento (Opcional)</Label>
            <Input
              id="discount_amount"
              type="number"
              step="0.01"
              min="0"
              value={discountAmount || ''}
              onChange={(e) =>
                setDiscountAmount(e.target.value ? parseFloat(e.target.value) : undefined)
              }
              disabled={recalculateTotals.isPending}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground">
              Deja vacío para mantener el descuento actual
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={recalculateTotals.isPending}>
              {recalculateTotals.isPending ? 'Recalculando...' : 'Recalcular'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

