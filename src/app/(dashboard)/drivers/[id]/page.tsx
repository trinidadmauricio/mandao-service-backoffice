'use client';

import { useParams } from 'next/navigation';
import { useDriver } from '@/lib/hooks/use-drivers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit } from 'lucide-react';
import { RoleGuard } from '@/components/auth/role-guard';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { DriverPerformanceCard } from '@/components/drivers/driver-performance-card';

export default function DriverDetailPage() {
  const params = useParams();
  const driverId = params.id as string;
  const { data: driver, isLoading, error } = useDriver(driverId);
  const { hasPermission } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando detalles del driver...</p>
        </div>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">
              Error al cargar los detalles del driver o driver no encontrado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const workTypeLabels: Record<string, string> = {
    FULL_TIME: 'Tiempo Completo',
    PART_TIME: 'Medio Tiempo',
    FREELANCE: 'Freelance',
  };

  return (
    <RoleGuard
      allowedRoles={['SUPERVISOR', 'LOGISTICS_PROVIDER']}
      requiredPermission={{ resource: 'drivers', action: 'read' }}
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {driver.user?.first_name} {driver.user?.last_name}
            </h1>
            <p className="text-muted-foreground mt-2">{driver.user?.email}</p>
          </div>
          {hasPermission('drivers', 'update') && (
            <Link href={`/drivers/${driver.id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Editar Driver
              </Button>
            </Link>
          )}
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID</p>
              <p className="text-base">{driver.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Documento de Identidad</p>
              <p className="text-base">{driver.identity_document}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Licencia de Conducir</p>
              <p className="text-base">{driver.driving_license}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha de Nacimiento</p>
              <p className="text-base">{new Date(driver.date_of_birth).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tipo de Trabajo</p>
              <Badge variant="outline">{workTypeLabels[driver.work_type] || driver.work_type}</Badge>
            </div>
            {driver.work_zone && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Zona de Trabajo</p>
                <p className="text-base">{driver.work_zone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <DriverPerformanceCard driver={driver} />

        <Card>
          <CardHeader>
            <CardTitle>Contacto de Emergencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nombre</p>
              <p className="text-base">
                {(driver.emergency_contact?.name as string) || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
              <p className="text-base">
                {(driver.emergency_contact?.phone as string) || 'N/A'}
              </p>
            </div>
            {driver.emergency_contact?.relationship ? (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Relación</p>
                <p className="text-base">
                  {String(driver.emergency_contact.relationship)}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehículo</CardTitle>
          </CardHeader>
          <CardContent>
            {driver.vehicle ? (
              <div className="space-y-2">
                <p className="text-base font-medium">
                  {driver.vehicle.license_plate} - {driver.vehicle.brand} {driver.vehicle.model}
                </p>
                <Badge variant="outline">{driver.vehicle.vehicle_type}</Badge>
                <div className="mt-4">
                  <Link href={`/vehicles/${driver.vehicle.id}`}>
                    <Button variant="outline" size="sm">
                      Ver Detalles del Vehículo
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No tiene vehículo asignado</p>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </RoleGuard>
  );
}

