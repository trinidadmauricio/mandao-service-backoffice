'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateOnDemandOrder } from '@/lib/hooks/use-orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

const onDemandOrderSchema = z.object({
  customer_snapshot: z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    email: z.string().email('Email inválido').optional(),
    phone: z.string().min(1, 'El teléfono es requerido'),
  }),
  delivery_address: z.object({
    street: z.string().min(1, 'La calle es requerida'),
    city: z.string().min(1, 'La ciudad es requerida'),
    state: z.string().optional(),
    zip_code: z.string().optional(),
    country: z.string().min(1, 'El país es requerido'),
    lat: z.number(),
    lng: z.number(),
  }),
  pickup_address: z
    .object({
      street: z.string(),
      city: z.string(),
      state: z.string().optional(),
      zip_code: z.string().optional(),
      country: z.string(),
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  items: z
    .array(
      z.object({
        product_snapshot: z.object({
          name: z.string(),
          price: z.number(),
          currency: z.string(),
        }),
        quantity: z.number().min(0.001),
        unit_price: z.number().min(0),
        notes: z.string().optional(),
      })
    )
    .min(1, 'Debe tener al menos un item'),
  special_instructions: z.string().optional(),
  scheduled_pickup_at: z.string().optional(),
  estimated_delivery_at: z.string().datetime(),
  priority: z.enum(['NORMAL', 'URGENT']).default('NORMAL'),
  cargo_description: z.string().optional(),
});

type OnDemandOrderFormData = z.infer<typeof onDemandOrderSchema>;

export function CreateOrderOnDemandForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const createOrder = useCreateOnDemandOrder();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OnDemandOrderFormData>({
    resolver: zodResolver(onDemandOrderSchema),
    defaultValues: {
      priority: 'NORMAL',
      items: [
        {
          product_snapshot: { name: '', price: 0, currency: 'USD' },
          quantity: 1,
          unit_price: 0,
        },
      ],
    },
  });

  const items = watch('items');

  const onSubmit = async (data: OnDemandOrderFormData) => {
    setError(null);

    try {
      const result = await createOrder.mutateAsync(data);
      router.push(`/orders/${result.order.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al crear la orden. Por favor, intenta nuevamente.'
      );
    }
  };

  const addItem = () => {
    const currentItems = watch('items');
    setValue('items', [
      ...currentItems,
      {
        product_snapshot: { name: '', price: 0, currency: 'USD' },
        quantity: 1,
        unit_price: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    const currentItems = watch('items');
    setValue('items', currentItems.filter((_, i) => i !== index));
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Crear Orden On-Demand</CardTitle>
        <CardDescription>Crear una nueva orden de entrega sin catálogo</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información del Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Nombre *</Label>
                <Input
                  id="customer_name"
                  {...register('customer_snapshot.name')}
                  disabled={createOrder.isPending}
                />
                {errors.customer_snapshot?.name && (
                  <p className="text-sm text-destructive">{errors.customer_snapshot.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_phone">Teléfono *</Label>
                <Input
                  id="customer_phone"
                  {...register('customer_snapshot.phone')}
                  disabled={createOrder.isPending}
                />
                {errors.customer_snapshot?.phone && (
                  <p className="text-sm text-destructive">{errors.customer_snapshot.phone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_email">Email (opcional)</Label>
                <Input
                  id="customer_email"
                  type="email"
                  {...register('customer_snapshot.email')}
                  disabled={createOrder.isPending}
                />
                {errors.customer_snapshot?.email && (
                  <p className="text-sm text-destructive">{errors.customer_snapshot.email.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dirección de Entrega</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delivery_street">Calle *</Label>
                <Input
                  id="delivery_street"
                  {...register('delivery_address.street')}
                  disabled={createOrder.isPending}
                />
                {errors.delivery_address?.street && (
                  <p className="text-sm text-destructive">{errors.delivery_address.street.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_city">Ciudad *</Label>
                <Input
                  id="delivery_city"
                  {...register('delivery_address.city')}
                  disabled={createOrder.isPending}
                />
                {errors.delivery_address?.city && (
                  <p className="text-sm text-destructive">{errors.delivery_address.city.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_country">País *</Label>
                <Input
                  id="delivery_country"
                  {...register('delivery_address.country')}
                  disabled={createOrder.isPending}
                />
                {errors.delivery_address?.country && (
                  <p className="text-sm text-destructive">{errors.delivery_address.country.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_lat">Latitud *</Label>
                <Input
                  id="delivery_lat"
                  type="number"
                  step="any"
                  {...register('delivery_address.lat', { valueAsNumber: true })}
                  disabled={createOrder.isPending}
                />
                {errors.delivery_address?.lat && (
                  <p className="text-sm text-destructive">{errors.delivery_address.lat.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_lng">Longitud *</Label>
                <Input
                  id="delivery_lng"
                  type="number"
                  step="any"
                  {...register('delivery_address.lng', { valueAsNumber: true })}
                  disabled={createOrder.isPending}
                />
                {errors.delivery_address?.lng && (
                  <p className="text-sm text-destructive">{errors.delivery_address.lng.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Items</h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                Agregar Item
              </Button>
            </div>
            {items.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre del Producto *</Label>
                    <Input
                      {...register(`items.${index}.product_snapshot.name`)}
                      disabled={createOrder.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cantidad *</Label>
                    <Input
                      type="number"
                      step="0.001"
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      disabled={createOrder.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Precio Unitario *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
                      disabled={createOrder.isPending}
                    />
                  </div>
                </div>
              </div>
            ))}
            {errors.items && (
              <p className="text-sm text-destructive">{errors.items.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información Adicional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimated_delivery_at">Fecha Estimada de Entrega *</Label>
                <Input
                  id="estimated_delivery_at"
                  type="datetime-local"
                  {...register('estimated_delivery_at')}
                  disabled={createOrder.isPending}
                />
                {errors.estimated_delivery_at && (
                  <p className="text-sm text-destructive">{errors.estimated_delivery_at.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad</Label>
                <select
                  id="priority"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...register('priority')}
                  disabled={createOrder.isPending}
                >
                  <option value="NORMAL">Normal</option>
                  <option value="URGENT">Urgente</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="special_instructions">Instrucciones Especiales</Label>
              <Input
                id="special_instructions"
                {...register('special_instructions')}
                disabled={createOrder.isPending}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createOrder.isPending}>
              {createOrder.isPending ? 'Creando...' : 'Crear Orden'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

