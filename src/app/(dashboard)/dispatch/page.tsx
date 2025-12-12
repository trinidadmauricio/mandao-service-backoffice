'use client';

import { useState, useMemo } from 'react';
import { useOrders } from '@/lib/hooks/use-orders';
import { useAssignDriver } from '@/lib/hooks/use-orders';
import { useAuth } from '@/lib/hooks/use-auth';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { TenantRequiredGuard } from '@/components/auth/tenant-required-guard';
import { OrdersPendingPanel } from '@/components/dispatch/orders-pending-panel';
import { DriversAvailablePanel } from '@/components/dispatch/drivers-available-panel';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Package } from 'lucide-react';

export default function DispatchPage() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>();
  const { toast } = useToast();

  // Obtener órdenes pendientes
  const { data: ordersResponse, isLoading: isLoadingOrders } = useOrders({
    status: undefined, // Obtener todas para filtrar después
  });

  const orders = useMemo(() => ordersResponse?.data || [], [ordersResponse?.data]);

  // Obtener orden seleccionada
  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return orders.find((o) => o.id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  // Obtener cargo_size de la orden seleccionada
  const orderCargoSize = useMemo(() => {
    if (!selectedOrder) return undefined;
    return selectedOrder.cargo_size;
  }, [selectedOrder]);

  // Obtener coordenadas de la orden seleccionada
  const orderLat = selectedOrder?.delivery_lat;
  const orderLng = selectedOrder?.delivery_lng;

  // Obtener logistics_provider_id del usuario
  const logisticsProviderId = user?.logistics_provider_id || undefined;

  // Mutation para asignar driver
  const assignDriver = useAssignDriver();

  const handleAssignDriver = async (driverId: string) => {
    if (!selectedOrderId) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona una orden primero.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await assignDriver.mutateAsync({
        orderId: selectedOrderId,
        driverId,
      });
      toast({
        title: 'Driver asignado',
        description: 'El driver ha sido asignado exitosamente a la orden.',
      });
      // Limpiar selección después de asignar
      setSelectedOrderId(undefined);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error al asignar el driver. Por favor, intenta nuevamente.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Verificar permisos
  const canAssignDrivers =
    hasPermission('orders', 'update') || hasPermission('orders', 'manage');

  if (!canAssignDrivers) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              No tienes permisos para acceder a esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PermissionGuard resource="orders" action="update">
      <TenantRequiredGuard>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Despacho de Órdenes</h1>
            <p className="text-muted-foreground mt-1">
              Asigna drivers a órdenes pendientes de manera eficiente
            </p>
          </div>

          {/* Información de orden seleccionada */}
          {selectedOrder && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-4 w-4" />
                  Orden Seleccionada: {selectedOrder.order_display_number}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {selectedOrder.delivery_address &&
                        typeof selectedOrder.delivery_address === 'object' &&
                        'address' in selectedOrder.delivery_address &&
                        String(selectedOrder.delivery_address.address)}
                    </span>
                  </div>
                  {orderCargoSize && (
                    <span className="text-muted-foreground">
                      Carga: <strong>{orderCargoSize}</strong>
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Panels principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel izquierdo: Órdenes pendientes */}
            <OrdersPendingPanel
              orders={orders}
              isLoading={isLoadingOrders}
              selectedOrderId={selectedOrderId}
              onSelectOrder={setSelectedOrderId}
            />

            {/* Panel derecho: Drivers disponibles */}
            <DriversAvailablePanel
              logisticsProviderId={logisticsProviderId}
              selectedOrderId={selectedOrderId}
              orderCargoSize={orderCargoSize}
              orderLat={orderLat}
              orderLng={orderLng}
              onAssignDriver={handleAssignDriver}
              isAssigning={assignDriver.isPending}
            />
          </div>
        </div>
      </TenantRequiredGuard>
    </PermissionGuard>
  );
}

