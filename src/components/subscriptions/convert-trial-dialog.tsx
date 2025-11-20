'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useConvertTrial } from '@/lib/hooks/use-subscriptions';
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
import { CreditCard } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const convertTrialSchema = z.object({
  payment_method_id: z.string().min(1, 'El método de pago es requerido'),
});

type ConvertTrialFormData = z.infer<typeof convertTrialSchema>;

interface ConvertTrialDialogProps {
  currentPlanName?: string;
}

export function ConvertTrialDialog({ currentPlanName }: ConvertTrialDialogProps) {
  const [open, setOpen] = useState(false);
  const convertTrial = useConvertTrial();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConvertTrialFormData>({
    resolver: zodResolver(convertTrialSchema),
  });

  const onSubmit = async (data: ConvertTrialFormData) => {
    try {
      await convertTrial.mutateAsync(data.payment_method_id);
      toast({
        title: 'Trial convertido',
        description: 'Tu período de prueba ha sido convertido a un plan de pago exitosamente.',
      });
      setOpen(false);
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Hubo un error al convertir el trial.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <CreditCard className="h-4 w-4 mr-2" />
          Convertir a Plan de Pago
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convertir Trial a Plan de Pago</DialogTitle>
          <DialogDescription>
            Convierte tu período de prueba activo a un plan de pago. Necesitarás proporcionar un
            método de pago válido en Stripe.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {currentPlanName && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm">
                Plan actual: <span className="font-medium">{currentPlanName}</span>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="payment_method_id">ID del Método de Pago en Stripe *</Label>
            <Input
              id="payment_method_id"
              placeholder="pm_1234567890"
              {...register('payment_method_id')}
              disabled={convertTrial.isPending}
            />
            {errors.payment_method_id && (
              <p className="text-sm text-destructive">{errors.payment_method_id.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Ingresa el ID del método de pago (Payment Method) de Stripe. Este se obtiene al
              agregar una tarjeta en Stripe.
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={convertTrial.isPending}>
              {convertTrial.isPending ? 'Convirtiendo...' : 'Convertir a Plan de Pago'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

