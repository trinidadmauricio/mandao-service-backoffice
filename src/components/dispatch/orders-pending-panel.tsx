'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { OrderStatusBadge } from '@/components/orders/order-status-badge';
import { Package, MapPin, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import type { Order } from '@/types/api';

interface OrdersPendingPanelProps {
  orders: Order[];
  isLoading?: boolean;
  selectedOrderId?: string;
  onSelectOrder?: (orderId: string) => void;
}

export function OrdersPendingPanel({
  orders,
  isLoading = false,
  selectedOrderId,
  onSelectOrder,
}: OrdersPendingPanelProps) {
  // Filtrar órdenes que necesitan asignación de driver
  const pendingOrders = orders.filter(
    (order) =>
      order.status === 'PENDING' ||
      order.status === 'CONFIRMED' ||
      (order.status === 'ASSIGNED' && !order.order_drivers?.some((od) => od.is_current && od.driver_id))
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Órdenes Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Órdenes Pendientes
          {pendingOrders.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {pendingOrders.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingOrders.length === 0 ? (
          <EmptyState
            variant="empty"
            title="No hay órdenes pendientes"
            description="Todas las órdenes tienen driver asignado."
            className="py-8"
          />
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {pendingOrders.map((order) => {
              const isSelected = selectedOrderId === order.id;
              const cargoSize = order.cargo_size;

              return (
                <div
                  key={order.id}
                  className={cn(
                    'p-4 border rounded-lg cursor-pointer transition-all hover:bg-accent',
                    isSelected && 'ring-2 ring-primary bg-accent'
                  )}
                  onClick={() => onSelectOrder?.(order.id)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{order.order_display_number}</p>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {order.tracking_code}
                        </p>
                      </div>
                      {cargoSize && (
                        <Badge variant="outline" className="text-xs">
                          {cargoSize}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {order.delivery_address &&
                            typeof order.delivery_address === 'object' &&
                            'address' in order.delivery_address &&
                            String(order.delivery_address.address)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                    </div>

                    {order.customer_snapshot &&
                      typeof order.customer_snapshot === 'object' &&
                      'name' in order.customer_snapshot && (
                        <p className="text-xs text-muted-foreground">
                          Cliente: {String(order.customer_snapshot.name)}
                        </p>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

