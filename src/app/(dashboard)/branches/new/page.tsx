import { BranchForm } from '@/components/branches/branch-form';
import { PermissionGuard } from '@/components/auth/permission-guard';

export default function NewBranchPage() {
  return (
    <PermissionGuard
      resource="branches"
      action="create"
      allowedTenantTypes={['RETAIL']}
      fallback={
        <div className="py-6">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-2">Acceso Restringido</h2>
            <p className="text-muted-foreground">No tienes permisos para crear sucursales.</p>
          </div>
        </div>
      }
    >
      <div className="py-6">
        <BranchForm />
      </div>
    </PermissionGuard>
  );
}

