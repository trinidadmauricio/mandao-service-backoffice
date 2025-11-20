'use client';

import { useParams } from 'next/navigation';
import { VehicleForm } from '@/components/vehicles/vehicle-form';
import { PermissionGuard } from '@/components/auth/permission-guard';

export default function EditVehiclePage() {
  const params = useParams();
  const vehicleId = params.id as string;

  return (
    <PermissionGuard
      resource="vehicles"
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
        <VehicleForm vehicleId={vehicleId} />
      </div>
    </PermissionGuard>
  );
}

