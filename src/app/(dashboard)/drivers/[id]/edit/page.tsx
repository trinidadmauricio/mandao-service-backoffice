'use client';

import { useParams } from 'next/navigation';
import { DriverForm } from '@/components/drivers/driver-form';
import { PermissionGuard } from '@/components/auth/permission-guard';

export default function EditDriverPage() {
  const params = useParams();
  const driverId = params.id as string;

  return (
    <PermissionGuard
      resource="drivers"
      action="update"
      allowedTenantTypes={['ON_DEMAND', 'HYBRID']}
      fallback={
        <div className="py-6">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-2">Acceso Restringido</h2>
            <p className="text-muted-foreground">
              Esta funcionalidad solo está disponible para tenants de tipo ON_DEMAND o HYBRID.
            </p>
          </div>
        </div>
      }
    >
      <div className="py-6">
        <DriverForm driverId={driverId} />
      </div>
    </PermissionGuard>
  );
}

