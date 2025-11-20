'use client';

import { useParams } from 'next/navigation';
import { useVehicle } from '@/lib/hooks/use-vehicles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit } from 'lucide-react';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { usePermissions } from '@/lib/hooks/use-permissions';

export default function VehicleDetailPage() {
  const params = useParams();
  const vehicleId = params.id as string;
  const { data: vehicle, isLoading, error } = useVehicle(vehicleId);
  const { hasPermission } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando detalles del vehículo...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">
              Error al cargar los detalles del vehículo o vehículo no encontrado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
    <PermissionGuard
      resource="vehicles"
      action="read"
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {vehicleTypeLabels[vehicle.vehicle_type] || vehicle.vehicle_type} - {vehicle.license_plate}
            </h1>
            <p className="text-muted-foreground mt-2">
              {vehicle.brand} {vehicle.model} {vehicle.year}
            </p>
          </div>
          {hasPermission('vehicles', 'update') && (
            <Link href={`/vehicles/${vehicle.id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Editar Vehículo
              </Button>
            </Link>
          )}
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Vehículo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID</p>
              <p className="text-base">{vehicle.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tipo</p>
              <Badge variant="outline">
                {vehicleTypeLabels[vehicle.vehicle_type] || vehicle.vehicle_type}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Placa</p>
              <p className="text-base">{vehicle.license_plate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Marca</p>
              <p className="text-base">{vehicle.brand}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Modelo</p>
              <p className="text-base">{vehicle.model}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Año</p>
              <p className="text-base">{vehicle.year}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Color</p>
              <p className="text-base">{vehicle.color}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Estado</p>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seguro y Mantenimiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Póliza de Seguro</p>
              <p className="text-base">{vehicle.insurance_policy}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Fecha de Expiración del Seguro
              </p>
              <p className="text-base">
                {new Date(vehicle.insurance_expires_at).toLocaleDateString()}
              </p>
            </div>
            {vehicle.last_maintenance_at && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Última Mantención</p>
                <p className="text-base">
                  {new Date(vehicle.last_maintenance_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {vehicle.driver && (
          <Card>
            <CardHeader>
              <CardTitle>Driver Asignado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-base font-medium">
                  {vehicle.driver.user?.first_name} {vehicle.driver.user?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">{vehicle.driver.user?.email}</p>
                <div className="mt-4">
                  <Link href={`/drivers/${vehicle.driver.id}`}>
                    <Button variant="outline" size="sm">
                      Ver Detalles del Driver
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </PermissionGuard>
  );
}

