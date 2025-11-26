'use client';

import { useVehicles, useDeleteVehicle } from '@/lib/hooks/use-vehicles';
import { RoleGuard } from '@/components/auth/role-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { usePermissions } from '@/lib/hooks/use-permissions';

export default function VehiclesPage() {
  const { data: vehicles, isLoading, error } = useVehicles();
  const deleteVehicle = useDeleteVehicle();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      await deleteVehicle.mutateAsync(id);
      toast({
        title: 'Vehículo eliminado',
        description: 'El vehículo ha sido eliminado exitosamente.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el vehículo. Por favor, intenta nuevamente.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const vehicleTypeLabels: Record<string, string> = {
    MOTORCYCLE: 'Motocicleta',
    SEDAN: 'Sedán',
    MINI_VAN: 'Mini Van',
    PANEL: 'Panel',
    TRUCK: 'Camión',
    PICKUP: 'Pickup',
  };

  const statusLabels: Record<string, string> = {
    AVAILABLE: 'Disponible',
    IN_SERVICE: 'En Servicio',
    MAINTENANCE: 'En Mantenimiento',
    OUT_OF_SERVICE: 'Fuera de Servicio',
  };

  return (
    <RoleGuard
      allowedRoles={['SUPERVISOR', 'LOGISTICS_PROVIDER']}
      requiredPermission={{ resource: 'vehicles', action: 'read' }}
      fallback={<div>No tienes permisos para acceder a esta página</div>}
    >
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando vehículos...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">Error al cargar los vehículos.</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Vehículos</h1>
              <p className="text-muted-foreground mt-2">Gestiona tu flota de vehículos</p>
            </div>
            {hasPermission('vehicles', 'create') && (
              <Link href="/vehicles/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Vehículo
                </Button>
              </Link>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Vehículos</CardTitle>
            </CardHeader>
            <CardContent>
              {vehicles && vehicles.length > 0 ? (
                <div className="space-y-4">
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">
                            {vehicleTypeLabels[vehicle.vehicle_type] || vehicle.vehicle_type} - {vehicle.license_plate}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {vehicle.brand} {vehicle.model} {vehicle.year}
                          </p>
                        </div>
                        <Badge
                          variant={
                            vehicle.status === 'AVAILABLE'
                              ? 'default'
                              : vehicle.status === 'IN_SERVICE'
                              ? 'secondary'
                              : vehicle.status === 'MAINTENANCE'
                              ? 'outline'
                              : 'destructive'
                          }
                        >
                          {statusLabels[vehicle.status] || vehicle.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        {hasPermission('vehicles', 'update') && (
                          <Link href={`/vehicles/${vehicle.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                          </Link>
                        )}
                        {hasPermission('vehicles', 'delete') && (
                          <ConfirmDialog
                            trigger={
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={deleteVehicle.isPending}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </Button>
                            }
                            title="Eliminar Vehículo"
                            description={`¿Estás seguro de que quieres eliminar el vehículo "${vehicle.license_plate}"? Esta acción no se puede deshacer.`}
                            confirmLabel="Eliminar"
                            cancelLabel="Cancelar"
                            variant="destructive"
                            onConfirm={() => handleDelete(vehicle.id)}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay vehículos registrados
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </RoleGuard>
  );
}

