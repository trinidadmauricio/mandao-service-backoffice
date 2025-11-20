'use client';

import { useParams } from 'next/navigation';
import { useOrder } from '@/lib/hooks/use-orders';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderStatusBadge } from '@/components/orders/order-status-badge';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { AssignDriverDialog } from '@/components/orders/assign-driver-dialog';
import { ChangeBranchDialog } from '@/components/orders/change-branch-dialog';
import { ModifyItemsDialog } from '@/components/orders/modify-items-dialog';
import { UpdateStatusDialog } from '@/components/orders/update-status-dialog';
import { CancelOrderDialog } from '@/components/orders/cancel-order-dialog';
import { RecalculateTotalsButton } from '@/components/orders/recalculate-totals-button';
import { OrderTimeline } from '@/components/orders/order-timeline';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { data: order, isLoading, error } = useOrder(orderId);
  const { hasPermission } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando orden...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">Error al cargar la orden o orden no encontrada.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PermissionGuard
      resource="orders"
      action="read"
      fallback={<div>No tienes permisos para acceder a esta página</div>}
    >
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orden {order.order_display_number}</h1>
          <p className="text-muted-foreground mt-2">Tracking: {order.tracking_code}</p>
        </div>
        <div className="flex items-center space-x-2">
          <OrderStatusBadge status={order.status} />
          <Badge variant="outline">{order.order_type}</Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Número de Orden</p>
              <p className="font-medium">{order.order_display_number}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tracking Code</p>
              <p className="font-medium">{order.tracking_code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <OrderStatusBadge status={order.status} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tipo</p>
              <Badge variant="outline">{order.order_type}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prioridad</p>
              <Badge variant={order.priority === 'URGENT' ? 'destructive' : 'default'}>
                {order.priority}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha Estimada de Entrega</p>
              <p className="font-medium">{formatDate(order.estimated_delivery_at)}</p>
            </div>
            {order.scheduled_pickup_at && (
              <div>
                <p className="text-sm text-muted-foreground">Pickup Programado</p>
                <p className="font-medium">{formatDate(order.scheduled_pickup_at)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.customer_snapshot && typeof order.customer_snapshot === 'object' && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">
                    {order.customer_snapshot.name || 'N/A'}
                  </p>
                </div>
                {order.customer_snapshot.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{order.customer_snapshot.phone}</p>
                  </div>
                )}
                {order.customer_snapshot.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{order.customer_snapshot.email}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dirección de Entrega</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.delivery_address && typeof order.delivery_address === 'object' && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Dirección</p>
                  <p className="font-medium">
                    {order.delivery_address.street}, {order.delivery_address.city}
                  </p>
                  {order.delivery_address.country && (
                    <p className="text-sm text-muted-foreground">
                      {order.delivery_address.country}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Coordenadas</p>
                  <p className="font-medium">
                    {order.delivery_lat}, {order.delivery_lng}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasPermission('orders', 'manage') && (
              <>
                <AssignDriverDialog orderId={order.id} />
                <ChangeBranchDialog orderId={order.id} />
                <ModifyItemsDialog
                  orderId={order.id}
                  currentItems={order.order_items?.map((item) => ({
                    id: item.id,
                    product_snapshot: item.product_snapshot as Record<string, unknown>,
                    quantity: Number(item.quantity),
                    unit_price: Number(item.unit_price),
                    notes: item.notes || undefined,
                  }))}
                />
                <UpdateStatusDialog orderId={order.id} currentStatus={order.status} />
                <RecalculateTotalsButton orderId={order.id} />
                {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                  <CancelOrderDialog orderId={order.id} orderNumber={order.order_display_number} />
                )}
              </>
            )}
            {order.special_instructions && (
              <div>
                <p className="text-sm text-muted-foreground">Instrucciones Especiales</p>
                <p className="font-medium">{order.special_instructions}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items Actuales */}
      <Card>
        <CardHeader>
          <CardTitle>Items Actuales</CardTitle>
        </CardHeader>
        <CardContent>
          {order.order_items && order.order_items.length > 0 ? (
            <div className="space-y-4">
              {order.order_items.map((item) => {
                const product = item.product_snapshot as Record<string, unknown>;
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{product.name as string || 'Producto'}</p>
                      <p className="text-sm text-muted-foreground">
                        Cantidad: {Number(item.quantity)} | Precio unitario: {formatCurrency(Number(item.unit_price), product.currency as string || 'USD')}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-1">Notas: {item.notes}</p>
                      )}
                    </div>
                    <p className="font-medium">
                      {formatCurrency(Number(item.quantity) * Number(item.unit_price), product.currency as string || 'USD')}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No hay items registrados</p>
          )}
        </CardContent>
      </Card>

      {/* Totales Actuales */}
      {order.order_summary_totals && order.order_summary_totals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Totales</CardTitle>
          </CardHeader>
          <CardContent>
            {order.order_summary_totals
              .filter((total) => total.is_current)
              .map((total) => (
                <div key={total.id} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">
                      {formatCurrency(Number(total.subtotal), total.currency)}
                    </span>
                  </div>
                  {Number(total.tax_amount) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Impuesto ({Number(total.tax_rate) * 100}%):
                      </span>
                      <span className="font-medium">
                        {formatCurrency(Number(total.tax_amount), total.currency)}
                      </span>
                    </div>
                  )}
                  {Number(total.delivery_fee) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tarifa de entrega:</span>
                      <span className="font-medium">
                        {formatCurrency(Number(total.delivery_fee), total.currency)}
                      </span>
                    </div>
                  )}
                  {Number(total.discount_amount) > 0 && (
                    <div className="flex justify-between text-destructive">
                      <span className="text-sm">Descuento:</span>
                      <span className="font-medium">
                        -{formatCurrency(Number(total.discount_amount), total.currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="font-medium">Total:</span>
                    <span className="text-lg font-bold">
                      {formatCurrency(Number(total.total_amount), total.currency)}
                    </span>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Historial */}
      {order && <OrderTimeline order={order} />}
    </div>
    </PermissionGuard>
  );
}

