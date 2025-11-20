'use client';

import { useDrivers, useDeleteDriver } from '@/lib/hooks/use-drivers';
import { RoleGuard } from '@/components/auth/role-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { usePermissions } from '@/lib/hooks/use-permissions';

export default function DriversPage() {
  const { data: drivers, isLoading, error } = useDrivers();
  const deleteDriver = useDeleteDriver();
  const { hasPermission } = usePermissions();

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este driver?')) {
      try {
        await deleteDriver.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting driver:', error);
      }
    }
  };

  return (
    <RoleGuard
      allowedRoles={['OWNER', 'SUPERVISOR', 'LOGISTICS_PROVIDER']}
      requiredPermission={{ resource: 'drivers', action: 'read' }}
      fallback={<div>No tienes permisos para acceder a esta página</div>}
    >
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando drivers...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">Error al cargar los drivers.</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Drivers</h1>
              <p className="text-muted-foreground mt-2">Gestiona tus conductores</p>
            </div>
            {hasPermission('drivers', 'create') && (
              <Link href="/drivers/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Driver
                </Button>
              </Link>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              {drivers && drivers.length > 0 ? (
                <div className="space-y-4">
                  {drivers.map((driver) => (
                    <div
                      key={driver.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">
                            {driver.user?.first_name || 'N/A'} {driver.user?.last_name || ''}
                          </p>
                          {driver.user?.email && (
                            <p className="text-sm text-muted-foreground">{driver.user.email}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Licencia: {driver.driving_license}
                          </p>
                        </div>
                        <Badge
                          variant={
                            driver.availability_status === 'AVAILABLE'
                              ? 'default'
                              : driver.availability_status === 'BUSY'
                              ? 'secondary'
                              : driver.availability_status === 'OFFLINE'
                              ? 'outline'
                              : 'destructive'
                          }
                        >
                          {driver.availability_status === 'AVAILABLE'
                            ? 'Disponible'
                            : driver.availability_status === 'BUSY'
                            ? 'Ocupado'
                            : driver.availability_status === 'OFFLINE'
                            ? 'Desconectado'
                            : 'Suspendido'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        {hasPermission('drivers', 'update') && (
                          <Link href={`/drivers/${driver.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                          </Link>
                        )}
                        {hasPermission('drivers', 'delete') && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(driver.id)}
                            disabled={deleteDriver.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No hay drivers registrados</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </RoleGuard>
  );
}

