'use client';

import { useParams } from 'next/navigation';
import { CategoryForm } from '@/components/categories/category-form';
import { PermissionGuard } from '@/components/auth/permission-guard';

export default function EditCategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;

  return (
    <PermissionGuard
      resource="products"
      action="update"
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
      <div className="py-6">
        <CategoryForm categoryId={categoryId} />
      </div>
    </PermissionGuard>
  );
}

