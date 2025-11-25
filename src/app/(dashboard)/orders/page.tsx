'use client';

import { useState, useMemo } from 'react';
import { useOrders, type OrdersFilters } from '@/lib/hooks/use-orders';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { useTenant, type Tenant } from '@/lib/hooks/use-tenant';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderStatusBadge } from '@/components/orders/order-status-badge';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Eye } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/date';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Order } from '@/types/api';

export default function OrdersPage() {
  const [filters, setFilters] = useState<OrdersFilters>({
    page: 1,
    limit: 10,
    search: '',
  });
  const { data: ordersResponse, isLoading, error } = useOrders(filters);
  const { hasPermission } = usePermissions();
  const { tenant } = useTenant();

  const orders = ordersResponse?.data || [];
  const totalCount = ordersResponse?.total;

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

  const columns: ColumnDef<Order>[] = useMemo(
    () => [
      {
        accessorKey: 'order_display_number',
        header: 'Orden',
        cell: ({ row }) => {
          const order = row.original;
          return (
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-medium">{order.order_display_number}</p>
                <OrderStatusBadge status={order.status} />
                <Badge variant="outline">{order.order_type}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Tracking: {order.tracking_code}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => {
          return <OrderStatusBadge status={row.original.status} />;
        },
      },
      {
        accessorKey: 'order_type',
        header: 'Tipo',
        cell: ({ row }) => {
          const orderType = row.original.order_type;
          return (
            <Badge variant="outline">
              {orderType === 'RETAIL' ? 'Retail' : 'On-Demand'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Fecha',
        cell: ({ row }) => {
          return formatDate(row.original.created_at);
        },
      },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
          const order = row.original;
          return (
            <Link href={`/orders/${order.id}`}>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalle
              </Button>
            </Link>
          );
        },
      },
    ],
    []
  );

  if (error) {
    return (
      <PermissionGuard
        resource="orders"
        action="read"
        fallback={<div>No tienes permisos para acceder a esta página</div>}
      >
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
      </PermissionGuard>
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
              {(tenant as Tenant | null) && ((tenant as Tenant).type === 'ON_DEMAND' || (tenant as Tenant).type === 'HYBRID') ? (
                <Link href="/orders/new/on-demand">
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Orden On-Demand
                  </Button>
                </Link>
              ) : null}
              {(tenant as Tenant | null) && ((tenant as Tenant).type === 'RETAIL' || (tenant as Tenant).type === 'HYBRID') ? (
                <Link href="/orders/new/retail">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Orden Retail
                  </Button>
                </Link>
              ) : null}
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Órdenes</CardTitle>
              <div className="flex items-center space-x-2">
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      status: value === 'all' ? undefined : (value as OrdersFilters['status']),
                      page: 1, // Reset to first page when filter changes
                    })
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value || 'all'} value={option.value || 'all'}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={orders}
              searchKey="order_display_number"
              searchPlaceholder="Buscar por número o tracking..."
              searchValue={filters.search}
              onSearchChange={(value) => setFilters({ ...filters, search: value, page: 1 })}
              pageSize={filters.limit || 10}
              totalCount={totalCount}
              currentPage={filters.page || 1}
              onPageChange={(page) => setFilters({ ...filters, page })}
              isLoading={isLoading}
              emptyStateTitle="No hay órdenes"
              emptyStateDescription="No se encontraron órdenes con los filtros seleccionados."
            />
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}
