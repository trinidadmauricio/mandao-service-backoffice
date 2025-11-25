'use client';

import { useBranches, useDeleteBranch } from '@/lib/hooks/use-branches';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, Edit, MapPin } from 'lucide-react';
import Link from 'next/link';
import { usePermissions } from '@/lib/hooks/use-permissions';

export default function BranchesPage() {
  const { data: branches, isLoading, error } = useBranches();
  const deleteBranch = useDeleteBranch();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      await deleteBranch.mutateAsync(id);
      toast({
        title: 'Sucursal eliminada',
        description: 'La sucursal ha sido eliminada exitosamente.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar la sucursal. Por favor, intenta nuevamente.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <PermissionGuard
      resource="branches"
      action="read"
      fallback={<div>No tienes permisos para acceder a esta página</div>}
    >
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando sucursales...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">Error al cargar las sucursales.</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Sucursales</h1>
              <p className="text-muted-foreground mt-2">Gestiona tus sucursales</p>
            </div>
            {hasPermission('branches', 'create') && (
              <Link href="/branches/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Sucursal
                </Button>
              </Link>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Sucursales</CardTitle>
            </CardHeader>
            <CardContent>
              {branches && branches.length > 0 ? (
                <div className="space-y-4">
                  {branches.map((branch) => (
                    <div
                      key={branch.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{branch.name}</p>
                            {branch.is_main && (
                              <Badge variant="default" className="text-xs">
                                Principal
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{branch.address}</p>
                          <p className="text-xs text-muted-foreground">
                            📍 {branch.gps_lat.toFixed(6)}, {branch.gps_lng.toFixed(6)}
                          </p>
                          <p className="text-xs text-muted-foreground">📞 {branch.contact_phone}</p>
                        </div>
                        <Badge
                          variant={branch.status === 'ACTIVE' ? 'default' : 'outline'}
                        >
                          {branch.status === 'ACTIVE' ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        {hasPermission('branches', 'update') && (
                          <Link href={`/branches/${branch.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                          </Link>
                        )}
                        {hasPermission('branches', 'delete') && (
                          <ConfirmDialog
                            trigger={
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={deleteBranch.isPending}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </Button>
                            }
                            title="Eliminar Sucursal"
                            description={`¿Estás seguro de que quieres eliminar la sucursal "${branch.name}"? Esta acción no se puede deshacer.`}
                            confirmLabel="Eliminar"
                            cancelLabel="Cancelar"
                            variant="destructive"
                            onConfirm={() => handleDelete(branch.id)}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay sucursales registradas
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </PermissionGuard>
  );
}
