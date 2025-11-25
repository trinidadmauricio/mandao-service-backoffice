'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateProductVariant } from '@/lib/hooks/use-product-variants';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

const variantSchema = z.object({
  sku: z.string().min(1, 'El SKU es requerido'),
  barcode: z.string().optional(),
  option1_name: z.string().optional(),
  option1_value: z.string().optional(),
  option2_name: z.string().optional(),
  option2_value: z.string().optional(),
  option3_name: z.string().optional(),
  option3_value: z.string().optional(),
  price_adjustment: z.number().default(0),
  cost_price: z.number().min(0).optional(),
  currency: z.string().length(3).default('USD'),
  track_inventory: z.boolean().default(true),
  current_stock: z.number().int().min(0).default(0),
  weight_kg: z.number().min(0).optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
});

type VariantFormData = z.infer<typeof variantSchema>;

interface ProductVariantFormProps {
  productId: string;
}

export function ProductVariantForm({ productId }: ProductVariantFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const createVariant = useCreateProductVariant();

  const form = useForm<VariantFormData>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      currency: 'USD',
      track_inventory: true,
      current_stock: 0,
      price_adjustment: 0,
      is_active: true,
      sku: '',
      barcode: '',
      option1_name: '',
      option1_value: '',
      option2_name: '',
      option2_value: '',
      option3_name: '',
      option3_value: '',
      cost_price: undefined,
      weight_kg: undefined,
      image_url: '',
    },
  });

  const onSubmit = async (data: VariantFormData) => {
    try {
      await createVariant.mutateAsync({
        product_id: productId,
        ...data,
      });
      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating variant:', error);
    }
  };

  if (!isOpen) {
    return (
      <Button type="button" onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Agregar Variante
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Nueva Variante</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU *</FormLabel>
                    <FormControl>
                      <Input disabled={createVariant.isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de Barras</FormLabel>
                    <FormControl>
                      <Input disabled={createVariant.isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="option1_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opción 1 - Nombre (ej: Color)</FormLabel>
                    <FormControl>
                      <Input disabled={createVariant.isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="option1_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opción 1 - Valor (ej: Rojo)</FormLabel>
                    <FormControl>
                      <Input disabled={createVariant.isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="option2_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opción 2 - Nombre (ej: Talla)</FormLabel>
                    <FormControl>
                      <Input disabled={createVariant.isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="option2_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opción 2 - Valor (ej: L)</FormLabel>
                    <FormControl>
                      <Input disabled={createVariant.isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="option3_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opción 3 - Nombre</FormLabel>
                    <FormControl>
                      <Input disabled={createVariant.isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="option3_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opción 3 - Valor</FormLabel>
                    <FormControl>
                      <Input disabled={createVariant.isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price_adjustment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ajuste de Precio</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        disabled={createVariant.isPending}
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
                name="cost_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio de Costo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        disabled={createVariant.isPending}
                        {...field}
                        value={field.value || ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="current_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Inicial</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        disabled={createVariant.isPending}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de Imagen</FormLabel>
                  <FormControl>
                    <Input type="url" disabled={createVariant.isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="track_inventory"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={createVariant.isPending}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Rastrear inventario</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={createVariant.isPending}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Variante activa</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createVariant.isPending}>
                {createVariant.isPending ? 'Creando...' : 'Crear Variante'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

