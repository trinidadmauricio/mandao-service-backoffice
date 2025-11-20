'use client';

import { useParams } from 'next/navigation';
import { BranchForm } from '@/components/branches/branch-form';
import { PermissionGuard } from '@/components/auth/permission-guard';

export default function EditBranchPage() {
  const params = useParams();
  const branchId = params.id as string;

  return (
    <PermissionGuard
      resource="branches"
      action="update"
      fallback={
        <div className="py-6">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-2">Acceso Restringido</h2>
            <p className="text-muted-foreground">No tienes permisos para editar sucursales.</p>
          </div>
        </div>
      }
    >
      <div className="py-6">
        <BranchForm branchId={branchId} />
      </div>
    </PermissionGuard>
  );
}

