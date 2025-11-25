'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateRetailOrder } from '@/lib/hooks/use-orders';
import { useProducts } from '@/lib/hooks/use-products';
import { useBranches } from '@/lib/hooks/use-branches';
import { RetailOrderItemField } from './retail-order-item-field';
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

  const form = useForm<RetailOrderFormData>({
    resolver: zodResolver(retailOrderSchema),
    defaultValues: {
      items: [
        {
          product_id: '',
          variant_id: '',
          quantity: 1,
        },
      ],
      customer_snapshot: {
        name: '',
        email: '',
        phone: '',
      },
      delivery_address: {
        street: '',
        city: '',
        state: '',
        zip_code: '',
        country: '',
        lat: 0,
        lng: 0,
      },
      branch_id: '',
      estimated_delivery_at: '',
    },
  });

  const { control, watch } = form;

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Snapshot */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium">Información del Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="customer_snapshot.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customer_snapshot.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customer_snapshot.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono *</FormLabel>
                      <FormControl>
                        <Input disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium">Dirección de Entrega</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="delivery_address.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calle *</FormLabel>
                      <FormControl>
                        <Input disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="delivery_address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad *</FormLabel>
                      <FormControl>
                        <Input disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="delivery_address.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País *</FormLabel>
                      <FormControl>
                        <Input disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="delivery_address.lat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitud *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
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
                    name="delivery_address.lng"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitud *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
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
              </div>
            </div>

            {/* Branch Selection */}
            <FormField
              control={form.control}
              name="branch_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sucursal *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una sucursal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {branches?.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name} - {branch.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  products={products?.data}
                  onRemove={() => remove(index)}
                  canRemove={fields.length > 1}
                  isPending={isPending}
                />
              );
            })}
            {form.formState.errors.items && (
              <p className="text-sm text-destructive">{form.formState.errors.items.message}</p>
            )}
          </div>

            {/* Estimated Delivery */}
            <FormField
              control={form.control}
              name="estimated_delivery_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Entrega Estimada *</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isPending ? 'Creando...' : 'Crear Orden'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

