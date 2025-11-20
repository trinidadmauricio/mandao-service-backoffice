'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateOnDemandOrder } from '@/lib/hooks/use-orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2 } from 'lucide-react';

const onDemandOrderSchema = z.object({
  customer_snapshot: z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    email: z.string().email('El email debe ser válido').optional().or(z.literal('')),
    phone: z.string().min(1, 'El teléfono es requerido'),
  }),
  delivery_address: z.object({
    street: z.string().min(1, 'La calle es requerida'),
    city: z.string().min(1, 'La ciudad es requerida'),
    state: z.string().optional(),
    zip_code: z.string().optional(),
    country: z.string().min(1, 'El país es requerido'),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  pickup_address: z
    .object({
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().optional(),
      zip_code: z.string().optional(),
      country: z.string().min(1),
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
  items: z
    .array(
      z.object({
        product_snapshot: z.object({
          name: z.string().min(1, 'El nombre del producto es requerido'),
          price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
          currency: z.string().length(3, 'El código de moneda debe tener 3 caracteres'),
        }),
        quantity: z.number().min(0.001, 'La cantidad debe ser mayor a 0'),
        unit_price: z.number().min(0, 'El precio unitario debe ser mayor o igual a 0'),
        notes: z.string().optional(),
      })
    )
    .min(1, 'Debe agregar al menos un item'),
  special_instructions: z.string().optional(),
  scheduled_pickup_at: z.string().optional().or(z.literal('')),
  estimated_delivery_at: z.string().min(1, 'La fecha de entrega estimada es requerida'),
  priority: z.enum(['NORMAL', 'URGENT']).default('NORMAL'),
  cargo_description: z.string().optional(),
});

type OnDemandOrderFormData = z.infer<typeof onDemandOrderSchema>;

export function OnDemandOrderForm() {
  const router = useRouter();
  const { toast } = useToast();
  const createOrder = useCreateOnDemandOrder();
  const [hasPickup, setHasPickup] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<OnDemandOrderFormData>({
    resolver: zodResolver(onDemandOrderSchema),
    defaultValues: {
      priority: 'NORMAL',
      items: [
        {
          product_snapshot: {
            name: '',
            price: 0,
            currency: 'USD',
          },
          quantity: 1,
          unit_price: 0,
          notes: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const onSubmit = async (data: OnDemandOrderFormData) => {
    try {
      const submitData = {
        ...data,
        pickup_address: hasPickup ? data.pickup_address : undefined,
        scheduled_pickup_at: data.scheduled_pickup_at || undefined,
        special_instructions: data.special_instructions || undefined,
        cargo_description: data.cargo_description || undefined,
        customer_snapshot: {
          ...data.customer_snapshot,
          email: data.customer_snapshot.email || undefined,
        },
      };

      const result = await createOrder.mutateAsync(submitData);
      toast({
        title: 'Orden creada',
        description: `Orden ${result.order_display_number} creada exitosamente. Tracking: ${result.tracking_code}`,
      });
      router.push(`/orders/${result.order.id}`);
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Hubo un error al crear la orden.',
        variant: 'destructive',
      });
    }
  };

  const isPending = createOrder.isPending;

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Nueva Orden On-Demand</CardTitle>
        <CardDescription>
          Crea una orden de entrega sin productos del catálogo (last-mile delivery)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Snapshot */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-medium">Información del Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Nombre *</Label>
                <Input
                  id="customer_name"
                  {...register('customer_snapshot.name')}
                  disabled={isPending}
                />
                {errors.customer_snapshot?.name && (
                  <p className="text-sm text-destructive">{errors.customer_snapshot.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_email">Email</Label>
                <Input
                  id="customer_email"
                  type="email"
                  {...register('customer_snapshot.email')}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_phone">Teléfono *</Label>
                <Input
                  id="customer_phone"
                  {...register('customer_snapshot.phone')}
                  disabled={isPending}
                />
                {errors.customer_snapshot?.phone && (
                  <p className="text-sm text-destructive">{errors.customer_snapshot.phone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-medium">Dirección de Entrega</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delivery_street">Calle *</Label>
                <Input
                  id="delivery_street"
                  {...register('delivery_address.street')}
                  disabled={isPending}
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
                  disabled={isPending}
                />
                {errors.delivery_address?.city && (
                  <p className="text-sm text-destructive">{errors.delivery_address.city.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_state">Estado/Provincia</Label>
                <Input
                  id="delivery_state"
                  {...register('delivery_address.state')}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_zip">Código Postal</Label>
                <Input
                  id="delivery_zip"
                  {...register('delivery_address.zip_code')}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_country">País *</Label>
                <Input
                  id="delivery_country"
                  {...register('delivery_address.country')}
                  disabled={isPending}
                />
                {errors.delivery_address?.country && (
                  <p className="text-sm text-destructive">{errors.delivery_address.country.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delivery_lat">Latitud *</Label>
                  <Input
                    id="delivery_lat"
                    type="number"
                    step="any"
                    {...register('delivery_address.lat', { valueAsNumber: true })}
                    disabled={isPending}
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
                    disabled={isPending}
                  />
                  {errors.delivery_address?.lng && (
                    <p className="text-sm text-destructive">{errors.delivery_address.lng.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pickup Address (Optional) */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="has_pickup"
                checked={hasPickup}
                onChange={(e) => setHasPickup(e.target.checked)}
                disabled={isPending}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="has_pickup" className="cursor-pointer">
                Tiene dirección de recogida
              </Label>
            </div>
          </div>

          {hasPickup && (
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium">Dirección de Recogida</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pickup_street">Calle *</Label>
                  <Input
                    id="pickup_street"
                    {...register('pickup_address.street')}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickup_city">Ciudad *</Label>
                  <Input
                    id="pickup_city"
                    {...register('pickup_address.city')}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickup_country">País *</Label>
                  <Input
                    id="pickup_country"
                    {...register('pickup_address.country')}
                    disabled={isPending}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pickup_lat">Latitud *</Label>
                    <Input
                      id="pickup_lat"
                      type="number"
                      step="any"
                      {...register('pickup_address.lat', { valueAsNumber: true })}
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickup_lng">Longitud *</Label>
                    <Input
                      id="pickup_lng"
                      type="number"
                      step="any"
                      {...register('pickup_address.lng', { valueAsNumber: true })}
                      disabled={isPending}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Items</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    product_snapshot: { name: '', price: 0, currency: 'USD' },
                    quantity: 1,
                    unit_price: 0,
                    notes: '',
                  })
                }
                disabled={isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Item
              </Button>
            </div>
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre del Producto *</Label>
                    <Input
                      {...register(`items.${index}.product_snapshot.name`)}
                      disabled={isPending}
                    />
                    {errors.items?.[index]?.product_snapshot?.name && (
                      <p className="text-sm text-destructive">
                        {errors.items[index]?.product_snapshot?.name?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Precio *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.product_snapshot.price`, { valueAsNumber: true })}
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Moneda *</Label>
                    <Input
                      maxLength={3}
                      {...register(`items.${index}.product_snapshot.currency`)}
                      disabled={isPending}
                      placeholder="USD"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cantidad *</Label>
                    <Input
                      type="number"
                      step="0.001"
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Precio Unitario *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <Label>Notas</Label>
                    <Input {...register(`items.${index}.notes`)} disabled={isPending} />
                  </div>
                </div>
              </div>
            ))}
            {errors.items && (
              <p className="text-sm text-destructive">{errors.items.message}</p>
            )}
          </div>

          {/* Other Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_delivery_at">Fecha de Entrega Estimada *</Label>
              <Input
                id="estimated_delivery_at"
                type="datetime-local"
                {...register('estimated_delivery_at')}
                disabled={isPending}
              />
              {errors.estimated_delivery_at && (
                <p className="text-sm text-destructive">{errors.estimated_delivery_at.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduled_pickup_at">Fecha de Recogida Programada</Label>
              <Input
                id="scheduled_pickup_at"
                type="datetime-local"
                {...register('scheduled_pickup_at')}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <select
                id="priority"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register('priority')}
                disabled={isPending}
              >
                <option value="NORMAL">Normal</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargo_description">Descripción de Carga</Label>
              <Input id="cargo_description" {...register('cargo_description')} disabled={isPending} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_instructions">Instrucciones Especiales</Label>
            <textarea
              id="special_instructions"
              {...register('special_instructions')}
              disabled={isPending}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creando...' : 'Crear Orden'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

