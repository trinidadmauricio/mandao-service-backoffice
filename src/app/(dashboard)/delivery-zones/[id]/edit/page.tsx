'use client';

import { useParams } from 'next/navigation';
import { DeliveryZoneForm } from '@/components/delivery-zones/delivery-zone-form';
import { PermissionGuard } from '@/components/auth/permission-guard';

export default function EditDeliveryZonePage() {
  const params = useParams();
  const zoneId = params.id as string;

  return (
    <PermissionGuard
      resource="delivery-zones"
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
        <DeliveryZoneForm zoneId={zoneId} />
      </div>
    </PermissionGuard>
  );
}

