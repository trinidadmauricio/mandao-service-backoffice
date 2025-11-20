'use client';

import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateRetailOrder } from '@/lib/hooks/use-orders';
import { useProducts } from '@/lib/hooks/use-products';
import { useBranches } from '@/lib/hooks/use-branches';
import { RetailOrderItemField } from './retail-order-item-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Plus } from 'lucide-react';

const retailOrderSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().uuid('El producto es requerido'),
        variant_id: z.string().uuid().optional().or(z.literal('')),
        quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1'),
      })
    )
    .min(1, 'Debe agregar al menos un item'),
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
  branch_id: z.string().uuid('La sucursal es requerida'),
  estimated_delivery_at: z.string().min(1, 'La fecha de entrega estimada es requerida'),
});

export type RetailOrderFormData = z.infer<typeof retailOrderSchema>;

export function RetailOrderForm() {
  const router = useRouter();
  const { toast } = useToast();
  const createOrder = useCreateRetailOrder();
  const { data: products } = useProducts();
  const { data: branches } = useBranches();

  const methods = useForm<RetailOrderFormData>({
    resolver: zodResolver(retailOrderSchema),
    defaultValues: {
      items: [
        {
          product_id: '',
          variant_id: '',
          quantity: 1,
        },
      ],
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');

  const onSubmit = async (data: RetailOrderFormData) => {
    try {
      const submitData = {
        ...data,
        items: data.items.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id || undefined,
          quantity: item.quantity,
        })),
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
      router.push(`/orders/${result.order_id}`);
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
        <CardTitle>Nueva Orden Retail</CardTitle>
        <CardDescription>
          Crea una orden de entrega con productos del catálogo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...methods}>
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

          {/* Branch Selection */}
          <div className="space-y-2">
            <Label htmlFor="branch_id">Sucursal *</Label>
            <select
              id="branch_id"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...register('branch_id')}
              disabled={isPending}
            >
              <option value="">Selecciona una sucursal</option>
              {branches?.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} - {branch.address}
                </option>
              ))}
            </select>
            {errors.branch_id && (
              <p className="text-sm text-destructive">{errors.branch_id.message}</p>
            )}
          </div>

          {/* Items */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Productos</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    product_id: '',
                    variant_id: '',
                    quantity: 1,
                  })
                }
                disabled={isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Producto
              </Button>
            </div>
            {fields.map((field, index) => {
              const selectedProductId = watchedItems[index]?.product_id;
              return (
                <RetailOrderItemField
                  key={field.id}
                  index={index}
                  productId={selectedProductId}
                  products={products}
                  onRemove={() => remove(index)}
                  canRemove={fields.length > 1}
                  isPending={isPending}
                  errors={{
                    product_id: errors.items?.[index]?.product_id,
                    quantity: errors.items?.[index]?.quantity,
                  }}
                />
              );
            })}
            {errors.items && (
              <p className="text-sm text-destructive">{errors.items.message}</p>
            )}
          </div>

          {/* Estimated Delivery */}
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

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creando...' : 'Crear Orden'}
            </Button>
          </div>
        </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}

