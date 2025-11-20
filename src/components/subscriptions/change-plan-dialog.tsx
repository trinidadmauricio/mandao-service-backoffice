'use client';

import { useState } from 'react';
import { useChangePlan } from '@/lib/hooks/use-subscriptions';
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
import { CreditCard } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ChangePlanDialogProps {
  currentPlanId?: string;
  availablePlans?: Array<{ id: string; name: string; price: number; currency: string }>;
}

export function ChangePlanDialog({ currentPlanId, availablePlans = [] }: ChangePlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const changePlan = useChangePlan();
  const { toast } = useToast();

  // Si no hay planes disponibles, usar planes por defecto
  const plans = availablePlans.length > 0
    ? availablePlans
    : [
        { id: 'basic', name: 'Básico', price: 29.99, currency: 'USD' },
        { id: 'professional', name: 'Profesional', price: 79.99, currency: 'USD' },
        { id: 'enterprise', name: 'Empresarial', price: 199.99, currency: 'USD' },
      ];

  const handleSubmit = async () => {
    if (!selectedPlanId) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar un plan',
        variant: 'destructive',
      });
      return;
    }

    if (selectedPlanId === currentPlanId) {
      toast({
        title: 'Error',
        description: 'Ya estás en este plan',
        variant: 'destructive',
      });
      return;
    }

    try {
      await changePlan.mutateAsync(selectedPlanId);
      toast({
        title: 'Plan actualizado',
        description: 'Tu plan de suscripción ha sido actualizado exitosamente.',
      });
      setOpen(false);
      setSelectedPlanId('');
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Hubo un error al cambiar el plan.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <CreditCard className="h-4 w-4 mr-2" />
          Cambiar Plan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar Plan de Suscripción</DialogTitle>
          <DialogDescription>
            Selecciona un nuevo plan para tu suscripción. El cambio se aplicará en el próximo ciclo
            de facturación.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Planes Disponibles</Label>
            <div className="space-y-2">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPlanId === plan.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-accent'
                  } ${currentPlanId === plan.id ? 'opacity-50' : ''}`}
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{plan.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${plan.price.toFixed(2)} {plan.currency}/mes
                      </p>
                    </div>
                    {currentPlanId === plan.id && (
                      <span className="text-xs text-muted-foreground">Plan Actual</span>
                    )}
                    {selectedPlanId === plan.id && (
                      <span className="text-xs text-primary">✓ Seleccionado</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={changePlan.isPending || !selectedPlanId || selectedPlanId === currentPlanId}
            >
              {changePlan.isPending ? 'Cambiando...' : 'Cambiar Plan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

