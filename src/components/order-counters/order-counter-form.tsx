'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateOrderCounter, useUpdateOrderCounter, type OrderCounter } from '@/lib/hooks/use-order-counters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
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

  const form = useForm<OrderCounterFormData>({
    resolver: zodResolver(orderCounterSchema),
    defaultValues: initialData
      ? {
          prefix: initialData.prefix || '',
          padding_length: initialData.padding_length,
          current_value: initialData.current_value,
          reset: false,
        }
      : {
          prefix: '',
          padding_length: 6,
          current_value: undefined,
          reset: false,
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

  const isPending = createCounter.isPending || updateCounter.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="prefix"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prefijo (Opcional, max 10 caracteres)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: ORD, PO"
                    maxLength={10}
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Prefijo para los números de orden (ej: ORD-000001)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="padding_length"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitud de Padding (1-10)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    disabled={isPending}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Número de dígitos para el padding (ej: 6 → 000001)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {isEditing && (
          <FormField
            control={form.control}
            name="current_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Actual (Opcional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    disabled={isPending}
                    {...field}
                    value={field.value || ''}
                    onChange={(e) =>
                      field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                  />
                </FormControl>
                <FormDescription>
                  Establece un nuevo valor para el contador manualmente
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {isEditing && (
          <FormField
            control={form.control}
            name="reset"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Resetear contador a 0</FormLabel>
                </div>
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending
              ? 'Guardando...'
              : isEditing
              ? 'Actualizar Contador'
              : 'Crear Contador'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

