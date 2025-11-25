'use client';

import { useState } from 'react';
import { useOrdersReport, useExportOrdersCSV, type OrdersReportFilters } from '@/lib/hooks/use-reports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import { OrdersChart } from './orders-chart';
import { Badge } from '@/components/ui/badge';

export function OrdersReportPage() {
  const [filters, setFilters] = useState<OrdersReportFilters>({});
  const { data: report, isLoading, error } = useOrdersReport(filters);
  const exportCSV = useExportOrdersCSV(filters);

  const handleExport = async () => {
    await exportCSV();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Generando reporte...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error al generar el reporte de órdenes.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Fecha Inicio</Label>
              <Input
                id="start_date"
                type="date"
                value={filters.start_date || ''}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value || undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Fecha Fin</Label>
              <Input
                id="end_date"
                type="date"
                value={filters.end_date || ''}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value || undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
              >
                <option value="">Todos</option>
                <option value="DRAFT">Borrador</option>
                <option value="PENDING">Pendiente</option>
                <option value="CONFIRMED">Confirmada</option>
                <option value="ASSIGNED">Asignada</option>
                <option value="IN_TRANSIT">En Tránsito</option>
                <option value="DELIVERED">Entregada</option>
                <option value="CANCELLED">Cancelada</option>
                <option value="FAILED">Fallida</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleExport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      {report?.summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Órdenes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.summary.total_orders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Revenue Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(report.summary.total_revenue || 0, 'USD')}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Valor Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(report.summary.average_order_value || 0, 'USD')}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Órdenes por Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {Object.entries(report.summary.orders_by_status || {}).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <span>{status}</span>
                    <Badge variant="outline">{count as number}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos */}
      {report && <OrdersChart data={report} />}

      {/* Tabla de Órdenes */}
      {report?.orders && report.orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Órdenes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">{order.status}</Badge>
                    <p className="font-medium">
                      {formatCurrency(order.total_amount || 0, 'USD')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

