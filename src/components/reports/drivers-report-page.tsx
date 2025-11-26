'use client';

import { useState } from 'react';
import { useDriversReport, type DriversReportFilters } from '@/lib/hooks/use-reports';
import { useDrivers } from '@/lib/hooks/use-drivers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils/currency';
import { Star } from 'lucide-react';
import { DriversChart } from './drivers-chart';
import Link from 'next/link';

export function DriversReportPage() {
  const [filters, setFilters] = useState<DriversReportFilters>({});
  const { data: report, isLoading, error } = useDriversReport(filters);
  const { data: drivers } = useDrivers();

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
          <p className="text-destructive">Error al generar el reporte de drivers.</p>
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
                onChange={(e) =>
                  setFilters({ ...filters, start_date: e.target.value || undefined })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Fecha Fin</Label>
              <Input
                id="end_date"
                type="date"
                value={filters.end_date || ''}
                onChange={(e) =>
                  setFilters({ ...filters, end_date: e.target.value || undefined })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driver_id">Driver</Label>
              <select
                id="driver_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filters.driver_id || ''}
                onChange={(e) =>
                  setFilters({ ...filters, driver_id: e.target.value || undefined })
                }
              >
                <option value="">Todos los drivers</option>
                {drivers?.data?.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.user?.first_name || 'N/A'} {driver.user?.last_name || ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      {report?.summary && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.summary.total_drivers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Entregas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.summary.total_deliveries}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rating Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {report.summary.average_rating?.toFixed(2) || 'N/A'}
                <Star className="inline h-5 w-5 ml-1 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos */}
      {report && <DriversChart data={report} />}

      {/* Tabla de Drivers */}
      {report?.drivers && report.drivers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento de Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.drivers
                .sort((a, b) => b.total_deliveries - a.total_deliveries)
                .map((driver) => (
                  <div
                    key={driver.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{driver.name}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-muted-foreground">
                          Entregas: {driver.total_deliveries}
                        </p>
                        {driver.rating_avg && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium">
                              {driver.rating_avg.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">
                          Revenue: {formatCurrency(driver.total_revenue, 'USD')}
                        </p>
                      </div>
                      <Link href={`/drivers/${driver.id}`}>
                        <Button variant="outline" size="sm">
                          Ver Detalle
                        </Button>
                      </Link>
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

