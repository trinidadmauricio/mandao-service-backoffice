'use client';

import { useParams } from 'next/navigation';
import { DeliveryRateForm } from '@/components/delivery-rates/delivery-rate-form';
import { RoleGuard } from '@/components/auth/role-guard';

export default function EditDeliveryRatePage() {
  const params = useParams();
  const rateId = params.id as string;

  return (
    <RoleGuard
      allowedRoles={['SUPERVISOR', 'LOGISTICS_PROVIDER']}
      requiredPermission={{ resource: 'delivery-rates', action: 'update' }}
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
        <DeliveryRateForm rateId={rateId} />
      </div>
    </RoleGuard>
  );
}

