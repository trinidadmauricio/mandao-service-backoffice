'use client';

import { useParams } from 'next/navigation';
import { useProduct } from '@/lib/hooks/use-products';
import { useProductVariants } from '@/lib/hooks/use-product-variants';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { ProductForm } from '@/components/products/product-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const { data: product, isLoading, error } = useProduct(productId);
  const { data: variants } = useProductVariants({ product_id: productId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">Error al cargar el producto o producto no encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PermissionGuard
      resource="products"
      action="read"
      allowedTenantTypes={['RETAIL']}
      fallback={
        <div className="py-6">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-2">Acceso Restringido</h2>
            <p className="text-muted-foreground">
              Esta funcionalidad solo está disponible para tenants de tipo RETAIL.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <div className="flex items-center space-x-2 mt-2">
          <Badge
            variant={
              product.status === 'active'
                ? 'default'
                : product.status === 'inactive'
                ? 'secondary'
                : 'outline'
            }
          >
            {product.status}
          </Badge>
          {product.sku && (
            <span className="text-sm text-muted-foreground">SKU: {product.sku}</span>
          )}
        </div>
      </div>

      <ProductForm productId={productId} />

      {variants && variants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Variantes ({variants.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {variants.map((variant) => (
                <div key={variant.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SKU: {variant.sku}</p>
                      {variant.option1_name && variant.option1_value && (
                        <p className="text-sm text-muted-foreground">
                          {variant.option1_name}: {variant.option1_value}
                          {variant.option2_name && variant.option2_value && (
                            <> | {variant.option2_name}: {variant.option2_value}</>
                          )}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Stock: {variant.current_stock} | Precio ajuste: {variant.price_adjustment}
                      </p>
                    </div>
                    <Badge variant={variant.is_active ? 'default' : 'outline'}>
                      {variant.is_active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </PermissionGuard>
  );
}

