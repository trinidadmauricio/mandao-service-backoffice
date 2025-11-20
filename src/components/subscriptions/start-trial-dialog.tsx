'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStartTrial } from '@/lib/hooks/use-subscriptions';
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
import { Play } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const startTrialSchema = z.object({
  plan_id: z.string().uuid('El plan es requerido'),
  trial_days: z.number().int().min(1).max(30, 'Los días de prueba deben estar entre 1 y 30'),
});

type StartTrialFormData = z.infer<typeof startTrialSchema>;

interface StartTrialDialogProps {
  availablePlans?: Array<{ id: string; name: string; price: number; currency: string }>;
}

export function StartTrialDialog({ availablePlans = [] }: StartTrialDialogProps) {
  const [open, setOpen] = useState(false);
  const startTrial = useStartTrial();
  const { toast } = useToast();

  const plans = availablePlans.length > 0
    ? availablePlans
    : [
        { id: 'basic', name: 'Básico', price: 29.99, currency: 'USD' },
        { id: 'professional', name: 'Profesional', price: 79.99, currency: 'USD' },
        { id: 'enterprise', name: 'Empresarial', price: 199.99, currency: 'USD' },
      ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<StartTrialFormData>({
    resolver: zodResolver(startTrialSchema),
    defaultValues: {
      trial_days: 14,
    },
  });

  const selectedPlanId = watch('plan_id');

  const onSubmit = async (data: StartTrialFormData) => {
    try {
      await startTrial.mutateAsync({
        plan_id: data.plan_id,
        trial_days: data.trial_days,
      });
      toast({
        title: 'Trial iniciado',
        description: `Período de prueba de ${data.trial_days} días iniciado exitosamente.`,
      });
      setOpen(false);
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Hubo un error al iniciar el período de prueba.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Play className="h-4 w-4 mr-2" />
          Iniciar Trial
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Iniciar Período de Prueba</DialogTitle>
          <DialogDescription>
            Inicia un período de prueba para evaluar las funcionalidades del plan seleccionado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plan_id">Plan *</Label>
            <select
              id="plan_id"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...register('plan_id')}
              disabled={startTrial.isPending}
            >
              <option value="">Selecciona un plan</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - ${plan.price.toFixed(2)} {plan.currency}/mes
                </option>
              ))}
            </select>
            {errors.plan_id && (
              <p className="text-sm text-destructive">{errors.plan_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="trial_days">Días de Prueba * (1-30)</Label>
            <Input
              id="trial_days"
              type="number"
              min="1"
              max="30"
              {...register('trial_days', { valueAsNumber: true })}
              disabled={startTrial.isPending}
            />
            {errors.trial_days && (
              <p className="text-sm text-destructive">{errors.trial_days.message}</p>
            )}
          </div>

          {selectedPlanId && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm">
                El período de prueba te dará acceso completo al plan seleccionado durante el tiempo
                especificado.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={startTrial.isPending || !selectedPlanId}>
              {startTrial.isPending ? 'Iniciando...' : 'Iniciar Trial'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

