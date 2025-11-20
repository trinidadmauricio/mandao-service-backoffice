'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateOrderCounter, useUpdateOrderCounter, type OrderCounter } from '@/lib/hooks/use-order-counters';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const orderCounterSchema = z.object({
  prefix: z.string().max(10, 'El prefijo no puede tener más de 10 caracteres').optional(),
  padding_length: z.number().int().min(1).max(10).optional(),
  current_value: z.number().int().min(0).optional(),
  reset: z.boolean().optional(),
});

type OrderCounterFormData = z.infer<typeof orderCounterSchema>;

interface OrderCounterFormProps {
  tenantId: string;
  initialData?: OrderCounter;
}

export function OrderCounterForm({ tenantId, initialData }: OrderCounterFormProps) {
  const createCounter = useCreateOrderCounter();
  const updateCounter = useUpdateOrderCounter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderCounterFormData>({
    resolver: zodResolver(orderCounterSchema),
    defaultValues: initialData
      ? {
          prefix: initialData.prefix || '',
          padding_length: initialData.padding_length,
          current_value: initialData.current_value,
        }
      : {
          padding_length: 6,
        },
  });

  const isEditing = !!initialData;

  const onSubmit = async (data: OrderCounterFormData) => {
    try {
      if (isEditing) {
        await updateCounter.mutateAsync({
          tenantId,
          data: {
            prefix: data.prefix || undefined,
            padding_length: data.padding_length,
            current_value: data.current_value,
            reset: data.reset,
          },
        });
        toast({
          title: 'Contador actualizado',
          description: 'El contador ha sido actualizado exitosamente.',
        });
      } else {
        await createCounter.mutateAsync({
          tenant_id: tenantId,
          prefix: data.prefix || undefined,
          padding_length: data.padding_length,
        });
        toast({
          title: 'Contador creado',
          description: 'El contador ha sido creado exitosamente.',
        });
      }
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Hubo un error al guardar el contador.',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prefix">Prefijo (Opcional, max 10 caracteres)</Label>
          <Input
            id="prefix"
            placeholder="Ej: ORD, PO"
            maxLength={10}
            {...register('prefix')}
            disabled={createCounter.isPending || updateCounter.isPending}
          />
          {errors.prefix && (
            <p className="text-sm text-destructive">{errors.prefix.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Prefijo para los números de orden (ej: ORD-000001)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="padding_length">Longitud de Padding (1-10)</Label>
          <Input
            id="padding_length"
            type="number"
            min="1"
            max="10"
            {...register('padding_length', { valueAsNumber: true })}
            disabled={createCounter.isPending || updateCounter.isPending}
          />
          {errors.padding_length && (
            <p className="text-sm text-destructive">{errors.padding_length.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Número de dígitos para el padding (ej: 6 → 000001)
          </p>
        </div>
      </div>

      {isEditing && (
        <div className="space-y-2">
          <Label htmlFor="current_value">Valor Actual (Opcional)</Label>
          <Input
            id="current_value"
            type="number"
            min="0"
            {...register('current_value', { valueAsNumber: true })}
            disabled={createCounter.isPending || updateCounter.isPending}
          />
          {errors.current_value && (
            <p className="text-sm text-destructive">{errors.current_value.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Establece un nuevo valor para el contador manualmente
          </p>
        </div>
      )}

      {isEditing && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="reset"
            {...register('reset')}
            disabled={createCounter.isPending || updateCounter.isPending}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="reset" className="cursor-pointer">
            Resetear contador a 0
          </Label>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={createCounter.isPending || updateCounter.isPending}
        >
          {createCounter.isPending || updateCounter.isPending
            ? 'Guardando...'
            : isEditing
            ? 'Actualizar Contador'
            : 'Crear Contador'}
        </Button>
      </div>
    </form>
  );
}

