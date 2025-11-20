'use client';

import { useParams } from 'next/navigation';
import { BrandForm } from '@/components/brands/brand-form';
import { PermissionGuard } from '@/components/auth/permission-guard';

export default function EditBrandPage() {
  const params = useParams();
  const brandId = params.id as string;

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
        <BrandForm brandId={brandId} />
      </div>
    </PermissionGuard>
  );
}

