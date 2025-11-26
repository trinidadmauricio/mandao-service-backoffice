'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateOnDemandOrder } from '@/lib/hooks/use-orders';
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
import { LocationPicker } from '@/components/shared/location-picker';

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

  const form = useForm<OnDemandOrderFormData>({
    resolver: zodResolver(onDemandOrderSchema),
    defaultValues: {
      priority: 'NORMAL',
      items: [
        {
          product_snapshot: { name: '', price: 0, currency: 'USD' },
          quantity: 1,
          unit_price: 0,
          notes: '',
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
      pickup_address: undefined,
      special_instructions: '',
      scheduled_pickup_at: '',
      estimated_delivery_at: '',
      cargo_description: '',
    },
  });

  const items = form.watch('items');

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
    const currentItems = form.getValues('items');
    form.setValue('items', [
      ...currentItems,
      {
        product_snapshot: { name: '', price: 0, currency: 'USD' },
        quantity: 1,
        unit_price: 0,
        notes: '',
      },
    ]);
  };

  const removeItem = (index: number) => {
    const currentItems = form.getValues('items');
    form.setValue('items', currentItems.filter((_, i) => i !== index));
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Crear Orden On-Demand</CardTitle>
        <CardDescription>Crear una nueva orden de entrega sin catálogo</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información del Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customer_snapshot.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input disabled={createOrder.isPending} {...field} />
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
                        <Input disabled={createOrder.isPending} {...field} />
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
                      <FormLabel>Email (opcional)</FormLabel>
                      <FormControl>
                        <Input type="email" disabled={createOrder.isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dirección de Entrega</h3>
              
              {/* Location Picker */}
              <FormField
                control={form.control}
                name="delivery_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación en el Mapa *</FormLabel>
                    <FormControl>
                      <LocationPicker
                        lat={field.value?.lat}
                        lng={field.value?.lng}
                        onLocationChange={(lat, lng, address) => {
                          field.onChange({
                            ...field.value,
                            lat,
                            lng,
                            street: address?.street || field.value?.street || '',
                            city: address?.city || field.value?.city || '',
                            state: address?.state || field.value?.state || '',
                            zip_code: address?.zip_code || field.value?.zip_code || '',
                            country: address?.country || field.value?.country || '',
                          });
                        }}
                        disabled={createOrder.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campos de dirección (se llenan automáticamente desde el mapa) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="delivery_address.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calle *</FormLabel>
                      <FormControl>
                        <Input disabled={createOrder.isPending} {...field} />
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
                        <Input disabled={createOrder.isPending} {...field} />
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
                        <Input disabled={createOrder.isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Items</h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                Agregar Item
              </Button>
            </div>
            {items.map((_item, index) => (
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
                  <FormField
                    control={form.control}
                    name={`items.${index}.product_snapshot.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Producto *</FormLabel>
                        <FormControl>
                          <Input disabled={createOrder.isPending} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.001"
                            disabled={createOrder.isPending}
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
                    name={`items.${index}.unit_price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio Unitario *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            disabled={createOrder.isPending}
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
            ))}
            {form.formState.errors.items && (
              <p className="text-sm text-destructive">{form.formState.errors.items.message}</p>
            )}
          </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información Adicional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="estimated_delivery_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha Estimada de Entrega *</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" disabled={createOrder.isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridad</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={createOrder.isPending}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una prioridad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NORMAL">Normal</SelectItem>
                          <SelectItem value="URGENT">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="special_instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instrucciones Especiales</FormLabel>
                    <FormControl>
                      <Input disabled={createOrder.isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
        </Form>
      </CardContent>
    </Card>
  );
}

