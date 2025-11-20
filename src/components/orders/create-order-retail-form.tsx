'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateRetailOrder } from '@/lib/hooks/use-orders';
import { useProducts } from '@/lib/hooks/use-products';
import { useBranches } from '@/lib/hooks/use-branches';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

const retailOrderSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().uuid().optional(),
        variant_id: z.string().uuid().optional(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, 'Debe tener al menos un item'),
  customer_snapshot: z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    phone: z.string().min(1, 'El teléfono es requerido'),
    email: z.string().email('Email inválido').optional(),
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
  branch_id: z.string().uuid('El branch es requerido'),
  estimated_delivery_at: z.string().datetime(),
});

type RetailOrderFormData = z.infer<typeof retailOrderSchema>;

export function CreateOrderRetailForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const createOrder = useCreateRetailOrder();
  const { data: products } = useProducts();
  const { data: branches } = useBranches();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RetailOrderFormData>({
    resolver: zodResolver(retailOrderSchema),
    defaultValues: {
      items: [{ quantity: 1 }],
    },
  });

  const items = watch('items');

  const onSubmit = async (data: RetailOrderFormData) => {
    setError(null);

    try {
      const result = await createOrder.mutateAsync(data);
      router.push(`/orders/${result.order_id}`);
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
    setValue('items', [...currentItems, { quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    const currentItems = watch('items');
    setValue('items', currentItems.filter((_, i) => i !== index));
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Crear Orden Retail</CardTitle>
        <CardDescription>Crear una nueva orden con productos del catálogo</CardDescription>
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
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sucursal</h3>
            <div className="space-y-2">
              <Label htmlFor="branch_id">Sucursal *</Label>
              <select
                id="branch_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register('branch_id')}
                disabled={createOrder.isPending}
              >
                <option value="">Selecciona una sucursal</option>
                {branches?.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
              {errors.branch_id && (
                <p className="text-sm text-destructive">{errors.branch_id.message}</p>
              )}
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
              <h3 className="text-lg font-semibold">Productos</h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                Agregar Producto
              </Button>
            </div>
            {items.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Producto {index + 1}</h4>
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
                    <Label>Producto</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      {...register(`items.${index}.product_id`)}
                      disabled={createOrder.isPending}
                    >
                      <option value="">Selecciona un producto</option>
                      {products?.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Cantidad *</Label>
                    <Input
                      type="number"
                      min="1"
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      disabled={createOrder.isPending}
                    />
                    {errors.items?.[index]?.quantity && (
                      <p className="text-sm text-destructive">
                        {errors.items[index]?.quantity?.message}
                      </p>
                    )}
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

