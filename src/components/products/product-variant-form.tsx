'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateProductVariant } from '@/lib/hooks/use-product-variants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VariantFormData>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      currency: 'USD',
      track_inventory: true,
      current_stock: 0,
      price_adjustment: 0,
      is_active: true,
    },
  });

  const onSubmit = async (data: VariantFormData) => {
    try {
      await createVariant.mutateAsync({
        product_id: productId,
        ...data,
      });
      reset();
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Nueva Variante</h3>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" {...register('sku')} disabled={createVariant.isPending} />
              {errors.sku && (
                <p className="text-sm text-destructive">{errors.sku.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Código de Barras</Label>
              <Input id="barcode" {...register('barcode')} disabled={createVariant.isPending} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="option1_name">Opción 1 - Nombre (ej: Color)</Label>
              <Input id="option1_name" {...register('option1_name')} disabled={createVariant.isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="option1_value">Opción 1 - Valor (ej: Rojo)</Label>
              <Input id="option1_value" {...register('option1_value')} disabled={createVariant.isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="option2_name">Opción 2 - Nombre (ej: Talla)</Label>
              <Input id="option2_name" {...register('option2_name')} disabled={createVariant.isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="option2_value">Opción 2 - Valor (ej: L)</Label>
              <Input id="option2_value" {...register('option2_value')} disabled={createVariant.isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="option3_name">Opción 3 - Nombre</Label>
              <Input id="option3_name" {...register('option3_name')} disabled={createVariant.isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="option3_value">Opción 3 - Valor</Label>
              <Input id="option3_value" {...register('option3_value')} disabled={createVariant.isPending} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price_adjustment">Ajuste de Precio</Label>
              <Input
                id="price_adjustment"
                type="number"
                step="0.01"
                {...register('price_adjustment', { valueAsNumber: true })}
                disabled={createVariant.isPending}
              />
              {errors.price_adjustment && (
                <p className="text-sm text-destructive">{errors.price_adjustment.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_price">Precio de Costo</Label>
              <Input
                id="cost_price"
                type="number"
                step="0.01"
                min="0"
                {...register('cost_price', { valueAsNumber: true })}
                disabled={createVariant.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_stock">Stock Inicial</Label>
              <Input
                id="current_stock"
                type="number"
                min="0"
                {...register('current_stock', { valueAsNumber: true })}
                disabled={createVariant.isPending}
              />
              {errors.current_stock && (
                <p className="text-sm text-destructive">{errors.current_stock.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL de Imagen</Label>
            <Input
              id="image_url"
              type="url"
              {...register('image_url')}
              disabled={createVariant.isPending}
            />
            {errors.image_url && (
              <p className="text-sm text-destructive">{errors.image_url.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="track_inventory"
              {...register('track_inventory')}
              disabled={createVariant.isPending}
              className="h-4 w-4 rounded border-gray-300"
              defaultChecked
            />
            <Label htmlFor="track_inventory" className="cursor-pointer">
              Rastrear inventario
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              {...register('is_active')}
              disabled={createVariant.isPending}
              className="h-4 w-4 rounded border-gray-300"
              defaultChecked
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Variante activa
            </Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createVariant.isPending}>
              {createVariant.isPending ? 'Creando...' : 'Crear Variante'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

