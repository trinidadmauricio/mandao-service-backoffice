'use client';

import { useFormContext } from 'react-hook-form';
import { useProductVariants } from '@/lib/hooks/use-product-variants';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { RetailOrderFormData } from './retail-order-form';

interface RetailOrderItemFieldProps {
  index: number;
  productId: string | undefined;
  products?: Array<{ id: string; name: string }>;
  onRemove: () => void;
  canRemove: boolean;
  isPending: boolean;
  errors: {
    product_id?: { message?: string };
    quantity?: { message?: string };
  };
}

export function RetailOrderItemField({
  index,
  productId,
  products,
  onRemove,
  canRemove,
  isPending,
  errors,
}: RetailOrderItemFieldProps) {
  const { register } = useFormContext<RetailOrderFormData>();
  const { data: variants } = useProductVariants(
    productId ? { product_id: productId } : undefined
  );

  return (
    <div className="border rounded p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Producto {index + 1}</h4>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Producto *</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...register(`items.${index}.product_id`)}
            disabled={isPending}
          >
            <option value="">Selecciona un producto</option>
            {products?.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          {errors.product_id && (
            <p className="text-sm text-destructive">{errors.product_id.message}</p>
          )}
        </div>
        {productId && variants && variants.length > 0 && (
          <div className="space-y-2">
            <Label>Variante (Opcional)</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...register(`items.${index}.variant_id`)}
              disabled={isPending}
            >
              <option value="">Sin variante</option>
              {variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.option1_value || variant.sku}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="space-y-2">
          <Label>Cantidad *</Label>
          <Input
            type="number"
            min="1"
            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
            disabled={isPending}
          />
          {errors.quantity && (
            <p className="text-sm text-destructive">{errors.quantity.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

