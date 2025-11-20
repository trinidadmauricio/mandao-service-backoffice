'use client';

import { useState } from 'react';
import { useOrders, type OrdersFilters } from '@/lib/hooks/use-orders';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { useTenant } from '@/lib/hooks/use-tenant';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderStatusBadge } from '@/components/orders/order-status-badge';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Search } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/date';
import { Input } from '@/components/ui/input';

export default function OrdersPage() {
  const [filters, setFilters] = useState<OrdersFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const { data: orders, isLoading, error } = useOrders(filters);
  const { hasPermission } = usePermissions();
  const { tenant } = useTenant();

  // Filtrar órdenes localmente por búsqueda
  const filteredOrders = orders?.filter((order) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      order.order_number.toLowerCase().includes(search) ||
      order.order_display_number.toLowerCase().includes(search) ||
      order.tracking_code.toLowerCase().includes(search)
    );
  });

  const statusOptions: Array<{ value: OrdersFilters['status']; label: string }> = [
    { value: undefined, label: 'Todos' },
    { value: 'DRAFT', label: 'Borrador' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'CONFIRMED', label: 'Confirmada' },
    { value: 'ASSIGNED', label: 'Asignada' },
    { value: 'IN_TRANSIT', label: 'En Tránsito' },
    { value: 'DELIVERED', label: 'Entregada' },
    { value: 'CANCELLED', label: 'Cancelada' },
    { value: 'FAILED', label: 'Fallida' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">Error al cargar las órdenes.</p>
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
            <h1 className="text-3xl font-bold">Órdenes</h1>
            <p className="text-muted-foreground mt-2">Gestiona tus órdenes de entrega</p>
          </div>
          {hasPermission('orders', 'create') && (
            <div className="flex gap-2">
              {(tenant?.type === 'ON_DEMAND' || tenant?.type === 'HYBRID') && (
                <Link href="/orders/new/on-demand">
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Orden On-Demand
                  </Button>
                </Link>
              )}
              {(tenant?.type === 'RETAIL' || tenant?.type === 'HYBRID') && (
                <Link href="/orders/new/retail">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Orden Retail
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Órdenes</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número o tracking..."
                  className="pl-8 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filters.status || ''}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value as OrdersFilters['status'] || undefined })
                }
              >
                {statusOptions.map((option) => (
                  <option key={option.value || 'all'} value={option.value || ''}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders && filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{order.order_display_number}</p>
                        <OrderStatusBadge status={order.status} />
                        <Badge variant="outline">{order.order_type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Tracking: {order.tracking_code}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Creada: {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalle
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm ? 'No se encontraron órdenes con ese criterio' : 'No hay órdenes registradas'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
    </PermissionGuard>
  );
}

