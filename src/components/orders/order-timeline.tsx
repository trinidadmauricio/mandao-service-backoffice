'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import { Clock, Truck, MapPin, Package, DollarSign, RefreshCw } from 'lucide-react';

interface OrderTimelineProps {
  order: {
    id: string;
    status: string;
    created_at: string;
    order_drivers?: Array<{
      id: string;
      driver_snapshot: Record<string, unknown>;
      is_current: boolean;
      created_at: string;
    }>;
    order_branches?: Array<{
      id: string;
      branch_snapshot: Record<string, unknown>;
      is_current: boolean;
      created_at: string;
    }>;
    order_items?: Array<{
      id: string;
      product_snapshot: Record<string, unknown>;
      quantity: number;
      unit_price: number;
      created_at: string;
    }>;
    order_summary_totals?: Array<{
      id: string;
      version: number;
      total_amount: number | string;
      currency: string;
      is_current: boolean;
      created_at: string;
    }>;
    order_status_history?: Array<{
      id: string;
      from_status: string | null;
      to_status: string;
      notes?: string;
      created_at: string;
    }>;
  };
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  // Combinar todos los eventos del historial en orden cronológico
  const events: Array<{
    type: 'status' | 'driver' | 'branch' | 'items' | 'totals';
    title: string;
    description: string;
    date: string;
    icon: React.ReactNode;
  }> = [];

  // Agregar eventos de estado
  order.order_status_history?.forEach((history) => {
    events.push({
      type: 'status',
      title: `Estado: ${history.from_status || 'Inicial'} → ${history.to_status}`,
      description: history.notes || '',
      date: history.created_at,
      icon: <RefreshCw className="h-4 w-4" />,
    });
  });

  // Agregar eventos de drivers
  order.order_drivers?.forEach((driver) => {
    const snapshot = driver.driver_snapshot as Record<string, unknown>;
    const user = snapshot?.user as { first_name?: string } | undefined;
    const driverName =
      user?.first_name ||
      (snapshot?.name as string | undefined) ||
      'Driver';
    events.push({
      type: 'driver',
      title: driver.is_current ? `Driver asignado: ${driverName}` : `Driver cambiado: ${driverName}`,
      description: driver.is_current ? 'Driver actual asignado' : 'Cambio de driver',
      date: driver.created_at,
      icon: <Truck className="h-4 w-4" />,
    });
  });

  // Agregar eventos de branches
  order.order_branches?.forEach((branch) => {
    const snapshot = branch.branch_snapshot as Record<string, unknown>;
    const branchName = (snapshot?.name as string | undefined) || 'Sucursal';
    events.push({
      type: 'branch',
      title: branch.is_current ? `Sucursal asignada: ${branchName}` : `Sucursal cambiada: ${branchName}`,
      description: branch.is_current ? 'Sucursal actual' : 'Cambio de sucursal',
      date: branch.created_at,
      icon: <MapPin className="h-4 w-4" />,
    });
  });

  // Agregar eventos de items (solo cuando hay múltiples versiones)
  const itemVersions = order.order_items?.reduce((acc, item) => {
    const date = item.created_at.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, typeof order.order_items>);

  if (itemVersions && Object.keys(itemVersions).length > 1) {
    Object.entries(itemVersions).forEach(([date, items]) => {
      events.push({
        type: 'items',
        title: `Items modificados (${items.length} items)`,
        description: 'Se actualizaron los items de la orden',
        date: `${date}T00:00:00`,
        icon: <Package className="h-4 w-4" />,
      });
    });
  }

  // Agregar eventos de totales
  order.order_summary_totals?.forEach((total) => {
    const totalAmount = typeof total.total_amount === 'string' 
      ? parseFloat(total.total_amount) 
      : total.total_amount;
    events.push({
      type: 'totals',
      title: `Totales recalculados (v${total.version})`,
      description: `Total: ${formatCurrency(totalAmount, total.currency)}`,
      date: total.created_at,
      icon: <DollarSign className="h-4 w-4" />,
    });
  });

  // Ordenar eventos por fecha
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Agregar evento de creación
  events.unshift({
    type: 'status',
    title: 'Orden creada',
    description: `Estado inicial: ${order.status}`,
    date: order.created_at,
    icon: <Clock className="h-4 w-4" />,
  });

  const typeColors = {
    status: 'text-primary',
    driver: 'text-blue-600 dark:text-blue-400',
    branch: 'text-purple-600 dark:text-purple-400',
    items: 'text-orange-600 dark:text-orange-400',
    totals: 'text-emerald-600 dark:text-emerald-400',
  };

  const typeBgColors = {
    status: 'bg-primary/10',
    driver: 'bg-blue-100 dark:bg-blue-900/30',
    branch: 'bg-purple-100 dark:bg-purple-900/30',
    items: 'bg-orange-100 dark:bg-orange-900/30',
    totals: 'bg-emerald-100 dark:bg-emerald-900/30',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de la Orden</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {events.map((event, index) => (
            <div key={index} className="flex items-start space-x-4 relative">
              {index < events.length - 1 && (
                <div className="absolute left-6 top-10 w-0.5 h-full bg-border" />
              )}
              <div
                className={cn(
                  'flex-shrink-0 p-2 rounded-full',
                  typeBgColors[event.type]
                )}
              >
                <div className={cn('h-5 w-5', typeColors[event.type])}>
                  {event.icon}
                </div>
              </div>
              <div className="flex-1 min-w-0 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(event.date)}</p>
                </div>
                {event.description && (
                  <p className="text-xs text-muted-foreground mb-2">{event.description}</p>
                )}
                <Badge variant="outline" className="text-xs">
                  {event.type}
                </Badge>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay historial disponible para esta orden
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

