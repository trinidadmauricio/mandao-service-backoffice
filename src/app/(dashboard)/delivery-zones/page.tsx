'use client';

import { useDeliveryZones, useDeleteDeliveryZone } from '@/lib/hooks/use-delivery-zones';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { usePermissions } from '@/lib/hooks/use-permissions';

export default function DeliveryZonesPage() {
  const { data: zones, isLoading, error } = useDeliveryZones();
  const deleteZone = useDeleteDeliveryZone();
  const { hasPermission } = usePermissions();

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta zona de entrega?')) {
      try {
        await deleteZone.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting zone:', error);
      }
    }
  };

  return (
    <PermissionGuard
      resource="delivery-zones"
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
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando zonas de entrega...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">Error al cargar las zonas de entrega.</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Zonas de Entrega</h1>
              <p className="text-muted-foreground mt-2">Gestiona las zonas geográficas de entrega</p>
            </div>
            {hasPermission('delivery-zones', 'create') && (
              <Link href="/delivery-zones/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Zona
                </Button>
              </Link>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Zonas de Entrega</CardTitle>
            </CardHeader>
            <CardContent>
              {zones && zones.length > 0 ? (
                <div className="space-y-4">
                  {zones.map((zone) => (
                    <div
                      key={zone.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{zone.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Tarifa base: {zone.base_rate} {zone.currency} | Por km: {zone.rate_per_km} {zone.currency}
                          </p>
                          {zone.surge_multiplier && (
                            <p className="text-xs text-muted-foreground">
                              Surge: {zone.surge_multiplier}x
                            </p>
                          )}
                        </div>
                        <Badge variant={zone.is_active ? 'default' : 'outline'}>
                          {zone.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        {hasPermission('delivery-zones', 'update') && (
                          <Link href={`/delivery-zones/${zone.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                          </Link>
                        )}
                        {hasPermission('delivery-zones', 'delete') && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(zone.id)}
                            disabled={deleteZone.isPending}
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
                <p className="text-center text-muted-foreground py-8">
                  No hay zonas de entrega registradas
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </PermissionGuard>
  );
}

