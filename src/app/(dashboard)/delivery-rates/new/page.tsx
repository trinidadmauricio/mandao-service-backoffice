import { DeliveryRateForm } from '@/components/delivery-rates/delivery-rate-form';
import { PermissionGuard } from '@/components/auth/permission-guard';

export default function NewDeliveryRatePage() {
  return (
    <PermissionGuard
      resource="delivery-rates"
      action="create"
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
        <DeliveryRateForm />
      </div>
    </PermissionGuard>
  );
}

