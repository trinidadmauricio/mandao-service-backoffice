'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateProduct, useUpdateProduct, useProduct } from '@/lib/hooks/use-products';
import { useCategories } from '@/lib/hooks/use-categories';
import { useBrands } from '@/lib/hooks/use-brands';
import { useProductVariants, useDeleteProductVariant } from '@/lib/hooks/use-product-variants';
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { ProductVariantForm } from './product-variant-form';
import { ProductImageUpload } from './product-image-upload';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Trash2 } from 'lucide-react';

const productSchema = z
  .object({
    name: z.string().min(1, 'El nombre es requerido'),
    description: z.string().optional(),
    sku: z.string().min(1, 'El SKU es requerido'),
    category_id: z.string().uuid('La categoría es requerida'),
    brand_id: z.string().uuid().optional(),
    cost_price: z.number().min(0, 'El precio de costo debe ser mayor o igual a 0'),
    selling_price: z.number().min(0, 'El precio de venta debe ser mayor o igual a 0'),
    images: z.record(z.unknown()).optional(),
    is_active: z.boolean().default(true),
    // Campos opcionales adicionales
    barcode: z.string().optional(),
    compare_at_price: z.number().min(0).optional(),
    currency: z.string().length(3).optional(),
    track_inventory: z.boolean().optional(),
    current_stock: z.number().int().min(0).optional(),
    min_stock_alert: z.number().int().min(0).optional(),
    uom: z.enum(['UNIT', 'KG', 'G', 'LITER', 'ML', 'BOX', 'PACK']).optional(),
    weight_kg: z.number().min(0).optional(),
    featured_image_url: z.string().url().optional(),
    has_variants: z.boolean().optional(),
    is_featured: z.boolean().optional(),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
  })
  .refine(
    () => {
      // Validar que images tenga al menos primary al crear
      // Esta validación se manejará en el componente
      return true;
    },
    {
      message: 'La imagen principal es requerida',
      path: ['images'],
    }
  );

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  productId?: string;
}

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!productId;
  const { data: product, isLoading: isLoadingProduct } = useProduct(productId || '');
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data: variants } = useProductVariants(productId ? { product_id: productId } : undefined);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteVariant = useDeleteProductVariant();
  const [error, setError] = useState<string | null>(null);
  const [primaryImageUrl, setPrimaryImageUrl] = useState<string>('');

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      is_active: true,
      name: '',
      description: '',
      sku: '',
      category_id: '',
      brand_id: '',
      cost_price: 0,
      selling_price: 0,
      images: {},
      track_inventory: true,
      current_stock: 0,
      has_variants: false,
      is_featured: false,
    },
  });

  // Cargar datos del producto si está editando
  useEffect(() => {
    if (product && isEditing) {
      const productImages = product.images && typeof product.images === 'object'
        ? (product.images as { primary?: string; gallery?: string[] })
        : { primary: '', gallery: [] };
      
      form.reset({
        name: product.name,
        description: product.description || '',
        sku: product.sku || '',
        is_active: product.is_active ?? true,
        category_id: product.category_id || '',
        brand_id: product.brand_id || '',
        cost_price: product.cost_price || 0,
        selling_price: product.selling_price || 0,
        images: productImages,
        barcode: product.barcode || undefined,
        compare_at_price: product.compare_at_price || undefined,
        currency: product.currency || undefined,
        track_inventory: product.track_inventory ?? true,
        current_stock: product.current_stock || 0,
        min_stock_alert: product.min_stock_alert || undefined,
        uom: product.uom || undefined,
        weight_kg: product.weight_kg || undefined,
        featured_image_url: product.featured_image_url || undefined,
        has_variants: product.has_variants || false,
        is_featured: product.is_featured || false,
        meta_title: product.meta_title || undefined,
        meta_description: product.meta_description || undefined,
      });
      
      // Cargar imagen principal si existe
      if (productImages.primary) {
        setPrimaryImageUrl(productImages.primary);
      }
    }
  }, [product, isEditing, form]);

  const onSubmit = async (data: ProductFormData) => {
    setError(null);

    try {
      // Validar imagen al crear
      if (!isEditing && !primaryImageUrl) {
        setError('La imagen principal es requerida para crear un producto');
        toast({
          title: 'Error de validación',
          description: 'La imagen principal es requerida para crear un producto.',
          variant: 'destructive',
        });
        return;
      }

      // Preparar datos para el backend
      const submitData = {
        ...data,
        // Asegurar que images sea un objeto válido (requerido por backend)
        images: primaryImageUrl
          ? {
              primary: primaryImageUrl,
              gallery: data.images && typeof data.images === 'object' && 'gallery' in data.images
                ? (data.images as { gallery?: string[] }).gallery
                : [],
            }
          : (data.images && typeof data.images === 'object'
              ? data.images
              : { primary: primaryImageUrl || '', gallery: [] }),
        // Limpiar campos undefined
        barcode: data.barcode || undefined,
        compare_at_price: data.compare_at_price || undefined,
        currency: data.currency || undefined,
        min_stock_alert: data.min_stock_alert || undefined,
        uom: data.uom || undefined,
        weight_kg: data.weight_kg || undefined,
        featured_image_url: data.featured_image_url || primaryImageUrl || undefined,
        meta_title: data.meta_title || undefined,
        meta_description: data.meta_description || undefined,
      };

      if (isEditing && productId) {
        await updateProduct.mutateAsync({
          id: productId,
          data: submitData,
        });
        toast({
          title: 'Producto actualizado',
          description: 'El producto ha sido actualizado exitosamente.',
        });
      } else {
        const result = await createProduct.mutateAsync(submitData);
        toast({
          title: 'Producto creado',
          description: 'El producto ha sido creado exitosamente.',
        });
        router.push(`/products/${result.id}`);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Error al guardar el producto. Por favor, intenta nuevamente.';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    try {
      await deleteVariant.mutateAsync(variantId);
      toast({
        title: 'Variante eliminada',
        description: 'La variante ha sido eliminada exitosamente.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar la variante. Por favor, intenta nuevamente.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input disabled={isPending} autoFocus={!isEditing} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU *</FormLabel>
                      <FormControl>
                        <Input disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value || undefined)}
                        value={field.value || undefined}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sin marca" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands?.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cost_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio de Costo *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
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
                  name="selling_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio de Venta *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
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

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Producto activo</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Imagen Principal *</FormLabel>
                <ProductImageUpload
                  imageUrl={primaryImageUrl || (product?.images && typeof product.images === 'object' && 'primary' in product.images ? (product.images as { primary?: string }).primary : '')}
                  onImageChange={(url) => {
                    setPrimaryImageUrl(url);
                    form.setValue('images', url ? { primary: url, gallery: [] } : { primary: '', gallery: [] });
                  }}
                  disabled={isPending}
                />
                <p className="text-sm text-muted-foreground">
                  La imagen principal es requerida para crear un producto
                </p>
              </div>

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
                  {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </Form>
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
                      <ConfirmDialog
                        trigger={
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deleteVariant.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </Button>
                        }
                        title="Eliminar Variante"
                        description={`¿Estás seguro de que quieres eliminar la variante con SKU "${variant.sku}"? Esta acción no se puede deshacer.`}
                        confirmLabel="Eliminar"
                        cancelLabel="Cancelar"
                        variant="destructive"
                        onConfirm={() => handleDeleteVariant(variant.id)}
                      />
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

