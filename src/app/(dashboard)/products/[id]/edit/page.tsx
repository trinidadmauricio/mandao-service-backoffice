'use client';

import { useParams } from 'next/navigation';
import { ProductForm } from '@/components/products/product-form';
import { PermissionGuard } from '@/components/auth/permission-guard';

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;

  return (
    <PermissionGuard
      resource="products"
      action="update"
      allowedTenantTypes={['RETAIL', 'HYBRID']}
      fallback={
        <div className="py-6">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-2">Acceso Restringido</h2>
            <p className="text-muted-foreground">
              Esta funcionalidad solo está disponible para tenants de tipo RETAIL o HYBRID.
            </p>
          </div>
        </div>
      }
    >
      <div className="py-6">
        <ProductForm productId={productId} />
      </div>
    </PermissionGuard>
  );
}

