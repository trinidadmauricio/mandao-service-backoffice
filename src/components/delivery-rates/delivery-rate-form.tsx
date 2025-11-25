'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateDeliveryRate, useUpdateDeliveryRate, useDeliveryRate } from '@/lib/hooks/use-delivery-rates';
import { useDeliveryZones } from '@/lib/hooks/use-delivery-zones';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Plus, X } from 'lucide-react';

const deliveryRateSchema = z.object({
  zone_id: z.string().uuid().optional().or(z.literal('')),
  vehicle_type: z.enum(['MOTORCYCLE', 'SEDAN', 'MINI_VAN', 'PANEL', 'TRUCK', 'PICKUP']),
  distance_km_min: z.number().min(0, 'La distancia mínima debe ser mayor o igual a 0'),
  distance_km_max: z.number().min(0, 'La distancia máxima debe ser mayor o igual a 0'),
  base_price: z.number().min(0, 'El precio base debe ser mayor o igual a 0'),
  price_per_km: z.number().min(0, 'El precio por km debe ser mayor o igual a 0'),
  currency: z.string().length(3, 'El código de moneda debe tener 3 caracteres').default('USD'),
  priority_multiplier: z.record(z.number()).default({}),
}).refine((data) => data.distance_km_max >= data.distance_km_min, {
  message: 'La distancia máxima debe ser mayor o igual a la mínima',
  path: ['distance_km_max'],
});

type DeliveryRateFormData = z.infer<typeof deliveryRateSchema>;

interface DeliveryRateFormProps {
  rateId?: string;
}

export function DeliveryRateForm({ rateId }: DeliveryRateFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!rateId;
  const { data: rate, isLoading: isLoadingRate } = useDeliveryRate(rateId || '');
  const { data: zones } = useDeliveryZones();
  const createRate = useCreateDeliveryRate();
  const updateRate = useUpdateDeliveryRate();
  const [priorityEntries, setPriorityEntries] = useState<Array<{ key: string; value: number }>>([]);

  const form = useForm<DeliveryRateFormData>({
    resolver: zodResolver(deliveryRateSchema),
    defaultValues: {
      currency: 'USD',
      vehicle_type: 'MOTORCYCLE',
      zone_id: '',
      distance_km_min: 0,
      distance_km_max: 0,
      base_price: 0,
      price_per_km: 0,
      priority_multiplier: {},
    },
  });

  useEffect(() => {
    if (rate && isEditing) {
      form.reset({
        zone_id: rate.zone_id || '',
        vehicle_type: rate.vehicle_type,
        distance_km_min: rate.distance_km_min,
        distance_km_max: rate.distance_km_max,
        base_price: rate.base_price,
        price_per_km: rate.price_per_km,
        currency: rate.currency,
        priority_multiplier: rate.priority_multiplier || {},
      });

      // Convert priority_multiplier object to array for editing
      const entries = Object.entries(rate.priority_multiplier || {}).map(([key, value]) => ({
        key,
        value,
      }));
      setPriorityEntries(entries);
    }
  }, [rate, isEditing, form]);

  const addPriorityEntry = () => {
    setPriorityEntries([...priorityEntries, { key: '', value: 1 }]);
  };

  const removePriorityEntry = (index: number) => {
    setPriorityEntries(priorityEntries.filter((_, i) => i !== index));
  };

  const updatePriorityEntry = (index: number, field: 'key' | 'value', value: string | number) => {
    const updated = [...priorityEntries];
    updated[index] = { ...updated[index], [field]: value };
    setPriorityEntries(updated);
  };

  const onSubmit = async (data: DeliveryRateFormData) => {
    try {
      // Convert priority entries array back to object
      const priorityMultiplier = priorityEntries.reduce((acc, entry) => {
        if (entry.key) {
          acc[entry.key] = entry.value;
        }
        return acc;
      }, {} as Record<string, number>);

      const submitData = {
        ...data,
        zone_id: data.zone_id || undefined,
        priority_multiplier: priorityMultiplier,
      };

      if (isEditing && rateId) {
        await updateRate.mutateAsync({
          id: rateId,
          data: submitData,
        });
        toast({
          title: 'Tarifa de entrega actualizada',
          description: 'La tarifa de entrega ha sido actualizada exitosamente.',
        });
      } else {
        await createRate.mutateAsync(submitData);
        toast({
          title: 'Tarifa de entrega creada',
          description: 'La tarifa de entrega ha sido creada exitosamente.',
        });
      }
      router.push('/delivery-rates');
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Hubo un error al guardar la tarifa de entrega.',
        variant: 'destructive',
      });
    }
  };

  if (isLoadingRate && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando tarifa de entrega...</p>
        </div>
      </div>
    );
  }

  const isPending = createRate.isPending || updateRate.isPending;

  const vehicleTypeLabels: Record<string, string> = {
    MOTORCYCLE: 'Motocicleta',
    SEDAN: 'Sedán',
    MINI_VAN: 'Mini Van',
    PANEL: 'Panel',
    TRUCK: 'Camión',
    PICKUP: 'Pickup',
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Tarifa de Entrega' : 'Nueva Tarifa de Entrega'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Actualiza la información de la tarifa de entrega'
            : 'Crea una nueva tarifa de entrega en el sistema'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="zone_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zona de Entrega (Opcional)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value || undefined)}
                      value={field.value || undefined}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas las zonas" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {zones?.map((zone) => (
                          <SelectItem key={zone.id} value={zone.id}>
                            {zone.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicle_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Vehículo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(vehicleTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="distance_km_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distancia Mínima (km) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        disabled={isPending}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="distance_km_max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distancia Máxima (km) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        disabled={isPending}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="base_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio Base *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        disabled={isPending}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price_per_km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio por km *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        disabled={isPending}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moneda *</FormLabel>
                    <FormControl>
                      <Input maxLength={3} placeholder="USD" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Multiplicadores por Prioridad</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPriorityEntry}
                disabled={isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
            {priorityEntries.map((entry, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder="NORMAL, EXPRESS, URGENT..."
                  value={entry.key}
                  onChange={(e) => updatePriorityEntry(index, 'key', e.target.value)}
                  disabled={isPending}
                  className="flex-1"
                />
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={entry.value}
                  onChange={(e) => updatePriorityEntry(index, 'value', parseFloat(e.target.value) || 0)}
                  disabled={isPending}
                  className="w-24"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removePriorityEntry(index)}
                  disabled={isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {priorityEntries.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                No hay multiplicadores configurados. Agrega uno para personalizar precios por prioridad.
              </p>
            )}
          </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

