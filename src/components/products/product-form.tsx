'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateProduct, useUpdateProduct, useProduct } from '@/lib/hooks/use-products';
import { useCategories } from '@/lib/hooks/use-categories';
import { useBrands } from '@/lib/hooks/use-brands';
import { useProductVariants, useCreateProductVariant, useDeleteProductVariant } from '@/lib/hooks/use-product-variants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { ProductVariantForm } from './product-variant-form';
import { Trash2 } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  sku: z.string().optional(),
  status: z.enum(['active', 'inactive', 'draft']).default('draft'),
  category_id: z.string().uuid().optional(),
  brand_id: z.string().uuid().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  productId?: string;
}

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!productId;
  const { data: product, isLoading: isLoadingProduct } = useProduct(productId || '');
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data: variants } = useProductVariants(productId ? { product_id: productId } : undefined);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const createVariant = useCreateProductVariant();
  const deleteVariant = useDeleteProductVariant();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: 'draft',
    },
  });

  // Cargar datos del producto si está editando
  useEffect(() => {
    if (product && isEditing) {
      setValue('name', product.name);
      setValue('description', product.description || '');
      setValue('sku', product.sku || '');
      setValue('status', product.status);
      setValue('category_id', product.category_id || '');
      setValue('brand_id', product.brand_id || '');
    }
  }, [product, isEditing, setValue]);

  const onSubmit = async (data: ProductFormData) => {
    setError(null);

    try {
      if (isEditing && productId) {
        await updateProduct.mutateAsync({
          id: productId,
          data,
        });
      } else {
        const result = await createProduct.mutateAsync(data);
        router.push(`/products/${result.id}`);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al guardar el producto. Por favor, intenta nuevamente.'
      );
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta variante?')) {
      try {
        await deleteVariant.mutateAsync(variantId);
      } catch (error) {
        console.error('Error deleting variant:', error);
      }
    }
  };

  if (isLoadingProduct && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando producto...</p>
        </div>
      </div>
    );
  }

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</CardTitle>
          <CardDescription>
            {isEditing
              ? 'Actualiza la información del producto'
              : 'Crea un nuevo producto en el catálogo'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input id="name" {...register('name')} disabled={isPending} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU (opcional)</Label>
                <Input id="sku" {...register('sku')} disabled={isPending} />
                {errors.sku && (
                  <p className="text-sm text-destructive">{errors.sku.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <textarea
                id="description"
                {...register('description')}
                disabled={isPending}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category_id">Categoría</Label>
                <select
                  id="category_id"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...register('category_id')}
                  disabled={isPending}
                >
                  <option value="">Sin categoría</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand_id">Marca</Label>
                <select
                  id="brand_id"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...register('brand_id')}
                  disabled={isPending}
                >
                  <option value="">Sin marca</option>
                  {brands?.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register('status')}
                disabled={isPending}
              >
                <option value="draft">Borrador</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {isEditing && productId && (
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle>Variantes del Producto</CardTitle>
            <CardDescription>
              Gestiona las variantes de este producto (tallas, colores, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {variants && variants.length > 0 ? (
              <div className="space-y-4">
                {variants.map((variant) => (
                  <div key={variant.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">SKU: {variant.sku}</p>
                        {variant.option1_name && variant.option1_value && (
                          <p className="text-sm text-muted-foreground">
                            {variant.option1_name}: {variant.option1_value}
                          </p>
                        )}
                        {variant.option2_name && variant.option2_value && (
                          <p className="text-sm text-muted-foreground">
                            {variant.option2_name}: {variant.option2_value}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Stock: {variant.current_stock}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteVariant(variant.id)}
                        disabled={deleteVariant.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No hay variantes registradas para este producto
              </p>
            )}
            <ProductVariantForm productId={productId} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

