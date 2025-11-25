'use client';

import { useFormContext } from 'react-hook-form';
import { useProductVariants } from '@/lib/hooks/use-product-variants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
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
import { Trash2 } from 'lucide-react';
import type { RetailOrderFormData } from './retail-order-form';

interface RetailOrderItemFieldProps {
  index: number;
  productId: string | undefined;
  products?: Array<{ id: string; name: string }>;
  onRemove: () => void;
  canRemove: boolean;
  isPending: boolean;
}

export function RetailOrderItemField({
  index,
  productId,
  products,
  onRemove,
  canRemove,
  isPending,
}: RetailOrderItemFieldProps) {
  const { control } = useFormContext<RetailOrderFormData>();
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
        <FormField
          control={control}
          name={`items.${index}.product_id`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Producto *</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value || undefined)}
                value={field.value || undefined}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Array.isArray(products) && products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {productId && variants && variants.length > 0 && (
          <FormField
            control={control}
            name={`items.${index}.variant_id`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Variante (Opcional)</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value || undefined)}
                  value={field.value || undefined}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sin variante" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {variants.map((variant) => (
                      <SelectItem key={variant.id} value={variant.id}>
                        {variant.option1_value || variant.sku}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={control}
          name={`items.${index}.quantity`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cantidad *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  disabled={isPending}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

