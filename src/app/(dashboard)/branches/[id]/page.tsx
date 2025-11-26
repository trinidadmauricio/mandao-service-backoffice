'use client';

import { useParams } from 'next/navigation';
import { useBranch } from '@/lib/hooks/use-branches';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit } from 'lucide-react';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { BranchForm } from '@/components/branches/branch-form';

export default function BranchDetailPage() {
  const params = useParams();
  const branchId = params.id as string;
  const { data: branch, isLoading, error } = useBranch(branchId);
  const { hasPermission } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando detalles de la sucursal...</p>
        </div>
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">
              Error al cargar los detalles de la sucursal o sucursal no encontrada.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PermissionGuard
      resource="branches"
      action="read"
      allowedTenantTypes={['RETAIL']}
      fallback={<div>No tienes permisos para acceder a esta página</div>}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{branch.name}</h1>
            <div className="flex items-center space-x-2 mt-2">
              {branch.is_main && (
                <Badge variant="default">Sucursal Principal</Badge>
              )}
              <Badge variant={branch.status === 'ACTIVE' ? 'default' : 'outline'}>
                {branch.status === 'ACTIVE' ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>
          </div>
          {hasPermission('branches', 'update') && (
            <Link href={`/branches/${branch.id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Editar Sucursal
              </Button>
            </Link>
          )}
        </div>

      <BranchForm branchId={branchId} />
    </div>
    </PermissionGuard>
  );
}

