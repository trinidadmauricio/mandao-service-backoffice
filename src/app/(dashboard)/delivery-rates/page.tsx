'use client';

import { useState } from 'react';
import { useDeliveryRates, useDeleteDeliveryRate } from '@/lib/hooks/use-delivery-rates';
import { RoleGuard } from '@/components/auth/role-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { useDeliveryZones } from '@/lib/hooks/use-delivery-zones';

export default function DeliveryRatesPage() {
  const [zoneFilter, setZoneFilter] = useState<string>('');
  const { data: zones } = useDeliveryZones();
  const { data: rates, isLoading, error } = useDeliveryRates(
    zoneFilter ? { zone_id: zoneFilter } : undefined
  );
  const deleteRate = useDeleteDeliveryRate();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      await deleteRate.mutateAsync(id);
      toast({
        title: 'Tarifa eliminada',
        description: 'La tarifa de entrega ha sido eliminada exitosamente.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar la tarifa de entrega. Por favor, intenta nuevamente.';
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

  return (
    <RoleGuard
      allowedRoles={['SUPERVISOR', 'LOGISTICS_PROVIDER']}
      requiredPermission={{ resource: 'delivery-rates', action: 'read' }}
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
            <p className="mt-4 text-muted-foreground">Cargando tarifas de entrega...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">Error al cargar las tarifas de entrega.</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Tarifas de Entrega</h1>
              <p className="text-muted-foreground mt-2">Gestiona las tarifas de entrega por zona y vehículo</p>
            </div>
            {hasPermission('delivery-rates', 'create') && (
              <Link href="/delivery-rates/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Tarifa
                </Button>
              </Link>
            )}
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lista de Tarifas de Entrega</CardTitle>
                <select
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                  className="flex h-10 w-64 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Todas las zonas</option>
                  {zones?.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              {rates && rates.length > 0 ? (
                <div className="space-y-4">
                  {rates.map((rate) => (
                    <div
                      key={rate.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">
                              {vehicleTypeLabels[rate.vehicle_type] || rate.vehicle_type}
                            </p>
                            {rate.zone && (
                              <Badge variant="outline">{rate.zone.name}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Distancia: {rate.distance_km_min} - {rate.distance_km_max} km
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Base: {rate.base_price} {rate.currency} | Por km: {rate.price_per_km} {rate.currency}
                          </p>
                          {Object.keys(rate.priority_multiplier || {}).length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Multiplicadores: {Object.entries(rate.priority_multiplier || {}).map(([k, v]) => `${k}: ${v}x`).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {hasPermission('delivery-rates', 'update') && (
                          <Link href={`/delivery-rates/${rate.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                          </Link>
                        )}
                        {hasPermission('delivery-rates', 'delete') && (
                          <ConfirmDialog
                            trigger={
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={deleteRate.isPending}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </Button>
                            }
                            title="Eliminar Tarifa de Entrega"
                            description={`¿Estás seguro de que quieres eliminar esta tarifa? Esta acción no se puede deshacer.`}
                            confirmLabel="Eliminar"
                            cancelLabel="Cancelar"
                            variant="destructive"
                            onConfirm={() => handleDelete(rate.id)}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay tarifas de entrega registradas
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </RoleGuard>
  );
}

