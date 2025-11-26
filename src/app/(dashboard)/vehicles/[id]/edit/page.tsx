'use client';

import { useParams } from 'next/navigation';
import { VehicleForm } from '@/components/vehicles/vehicle-form';
import { RoleGuard } from '@/components/auth/role-guard';

export default function EditVehiclePage() {
  const params = useParams();
  const vehicleId = params.id as string;

  return (
    <RoleGuard
      allowedRoles={['SUPERVISOR', 'LOGISTICS_PROVIDER']}
      requiredPermission={{ resource: 'vehicles', action: 'update' }}
      fallback={
        <div className="py-6">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-2">Acceso Restringido</h2>
            <p className="text-muted-foreground">
              Esta funcionalidad solo está disponible para proveedores de logística y supervisores.
            </p>
          </div>
        </div>
      }
    >
      <div className="py-6">
        <VehicleForm vehicleId={vehicleId} />
      </div>
    </RoleGuard>
  );
}

