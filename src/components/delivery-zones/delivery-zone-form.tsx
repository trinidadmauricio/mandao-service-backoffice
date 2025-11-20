'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateDeliveryZone, useUpdateDeliveryZone, useDeliveryZone } from '@/lib/hooks/use-delivery-zones';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

const deliveryZoneSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  boundary: z.string().min(1, 'El boundary (WKT) es requerido'),
  base_rate: z.number().min(0, 'La tarifa base debe ser mayor o igual a 0'),
  rate_per_km: z.number().min(0, 'La tarifa por km debe ser mayor o igual a 0'),
  surge_multiplier: z.number().min(0).max(10).optional(),
  currency: z.string().length(3, 'El código de moneda debe tener 3 caracteres').default('USD'),
  is_active: z.boolean().default(true),
});

type DeliveryZoneFormData = z.infer<typeof deliveryZoneSchema>;

interface DeliveryZoneFormProps {
  zoneId?: string;
}

export function DeliveryZoneForm({ zoneId }: DeliveryZoneFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!zoneId;
  const { data: zone, isLoading: isLoadingZone } = useDeliveryZone(zoneId || '');
  const createZone = useCreateDeliveryZone();
  const updateZone = useUpdateDeliveryZone();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<DeliveryZoneFormData>({
    resolver: zodResolver(deliveryZoneSchema),
    defaultValues: {
      currency: 'USD',
      is_active: true,
    },
  });

  useEffect(() => {
    if (zone && isEditing) {
      setValue('name', zone.name);
      setValue('boundary', zone.boundary);
      setValue('base_rate', zone.base_rate);
      setValue('rate_per_km', zone.rate_per_km);
      setValue('surge_multiplier', zone.surge_multiplier);
      setValue('currency', zone.currency);
      setValue('is_active', zone.is_active);
    }
  }, [zone, isEditing, setValue]);

  const onSubmit = async (data: DeliveryZoneFormData) => {
    try {
      const submitData = {
        ...data,
        surge_multiplier: data.surge_multiplier || undefined,
      };

      if (isEditing && zoneId) {
        await updateZone.mutateAsync({
          id: zoneId,
          data: submitData,
        });
        toast({
          title: 'Zona de entrega actualizada',
          description: 'La zona de entrega ha sido actualizada exitosamente.',
        });
      } else {
        await createZone.mutateAsync(submitData);
        toast({
          title: 'Zona de entrega creada',
          description: 'La zona de entrega ha sido creada exitosamente.',
        });
      }
      router.push('/delivery-zones');
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Hubo un error al guardar la zona de entrega.',
        variant: 'destructive',
      });
    }
  };

  if (isLoadingZone && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando zona de entrega...</p>
        </div>
      </div>
    );
  }

  const isPending = createZone.isPending || updateZone.isPending;

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Zona de Entrega' : 'Nueva Zona de Entrega'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Actualiza la información de la zona de entrega'
            : 'Crea una nueva zona de entrega en el sistema'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" {...register('name')} disabled={isPending} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="boundary">
              Boundary (WKT) *{' '}
              <span className="text-xs text-muted-foreground">
                (Formato: POLYGON((lng1 lat1, lng2 lat2, ...)))
              </span>
            </Label>
            <textarea
              id="boundary"
              {...register('boundary')}
              disabled={isPending}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              placeholder="POLYGON((-58.3816 -34.6037, -58.3826 -34.6047, -58.3836 -34.6057, -58.3816 -34.6037))"
            />
            {errors.boundary && (
              <p className="text-sm text-destructive">{errors.boundary.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_rate">Tarifa Base *</Label>
              <Input
                id="base_rate"
                type="number"
                step="0.01"
                min="0"
                {...register('base_rate', { valueAsNumber: true })}
                disabled={isPending}
              />
              {errors.base_rate && (
                <p className="text-sm text-destructive">{errors.base_rate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate_per_km">Tarifa por Kilómetro *</Label>
              <Input
                id="rate_per_km"
                type="number"
                step="0.01"
                min="0"
                {...register('rate_per_km', { valueAsNumber: true })}
                disabled={isPending}
              />
              {errors.rate_per_km && (
                <p className="text-sm text-destructive">{errors.rate_per_km.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="surge_multiplier">Multiplicador de Surge (0-10)</Label>
              <Input
                id="surge_multiplier"
                type="number"
                step="0.1"
                min="0"
                max="10"
                {...register('surge_multiplier', { valueAsNumber: true })}
                disabled={isPending}
              />
              {errors.surge_multiplier && (
                <p className="text-sm text-destructive">{errors.surge_multiplier.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moneda *</Label>
              <Input
                id="currency"
                maxLength={3}
                {...register('currency')}
                disabled={isPending}
                placeholder="USD"
              />
              {errors.currency && (
                <p className="text-sm text-destructive">{errors.currency.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                {...register('is_active')}
                disabled={isPending}
                className="h-4 w-4 rounded border-gray-300"
                defaultChecked
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Zona activa
              </Label>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

