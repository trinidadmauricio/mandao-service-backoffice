'use client';

import { useParams } from 'next/navigation';
import { DriverForm } from '@/components/drivers/driver-form';
import { RoleGuard } from '@/components/auth/role-guard';

export default function EditDriverPage() {
  const params = useParams();
  const driverId = params.id as string;

  return (
    <RoleGuard
      allowedRoles={['SUPERVISOR', 'LOGISTICS_PROVIDER']}
      requiredPermission={{ resource: 'drivers', action: 'update' }}
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
        <DriverForm driverId={driverId} />
      </div>
    </RoleGuard>
  );
}

