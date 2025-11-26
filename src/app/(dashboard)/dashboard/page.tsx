'use client';

import { useState, useMemo } from 'react';
import { useDashboardKPIs, type Period } from '@/lib/hooks/use-dashboard-kpis';
import { useOrdersReport } from '@/lib/hooks/use-orders-report';
import { useSelectedTenant } from '@/lib/hooks/use-selected-tenant';
import { useAuth } from '@/lib/hooks/use-auth';
import { KPICard } from '@/components/dashboard/kpi-card';
import { OrdersChart } from '@/components/dashboard/orders-chart';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { StatusDistributionChart } from '@/components/dashboard/status-distribution-chart';
import { TopProductsChart } from '@/components/dashboard/top-products-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { USER_ROLE } from '@/lib/constants/roles';
import { Package, DollarSign, TrendingUp, Users, Building2, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('month');
  const { user } = useAuth();
  const { selectedTenantId } = useSelectedTenant();
  const isSAASAdmin = user && (user.role === USER_ROLE.SAAS_ADMIN || user.role === USER_ROLE.SAAS_EDITOR);
  const { data: kpis, isLoading, error } = useDashboardKPIs(period);
  
  // Calcular fechas para el reporte basado en el período
  const reportFilters = useMemo(() => {
    const now = new Date();
    const filters: { start_date?: string; end_date?: string } = {};
    
    switch (period) {
      case 'today':
        filters.start_date = now.toISOString().split('T')[0];
        filters.end_date = now.toISOString().split('T')[0];
        break;
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filters.start_date = weekAgo.toISOString().split('T')[0];
        filters.end_date = now.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filters.start_date = monthAgo.toISOString().split('T')[0];
        filters.end_date = now.toISOString().split('T')[0];
        break;
      case 'year':
        const yearAgo = new Date(now);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        filters.start_date = yearAgo.toISOString().split('T')[0];
        filters.end_date = now.toISOString().split('T')[0];
        break;
    }
    
    return filters;
  }, [period]);
  
  const { data: reportData, isLoading: isLoadingReport } = useOrdersReport(reportFilters);

  const periods: { value: Period; label: string }[] = [
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta Semana' },
    { value: 'month', label: 'Este Mes' },
    { value: 'year', label: 'Este Año' },
  ];

  // Si es SAAS_ADMIN y no ha seleccionado un tenant, mostrar mensaje
  if (isSAASAdmin && !selectedTenantId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Selecciona un Tenant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Para ver los datos del dashboard, por favor selecciona un tenant desde el selector en la parte superior.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <EmptyState
          variant="error"
          title="Error al cargar el dashboard"
          description="Ocurrió un error al cargar los datos. Por favor, intenta nuevamente."
          icon={<AlertCircle className="h-12 w-12 text-destructive" />}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Resumen de tu operación</p>
        </div>
        <div className="flex gap-2">
          {periods.map((p) => (
            <Button
              key={p.value}
              variant={period === p.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-6 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <SkeletonText lines={1} className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : kpis ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total de Órdenes"
            value={kpis.total_orders}
            description={`Órdenes en el período seleccionado`}
            icon={<Package className="h-6 w-6" />}
            variant="orders"
          />
          <KPICard
            title="Revenue Total"
            value={kpis.total_revenue}
            currency="USD"
            description={`Ingresos en el período seleccionado`}
            icon={<DollarSign className="h-6 w-6" />}
            variant="revenue"
          />
          <KPICard
            title="Valor Promedio"
            value={kpis.average_order_value}
            currency="USD"
            description={`Valor promedio por orden`}
            icon={<TrendingUp className="h-6 w-6" />}
            variant="average"
          />
          <KPICard
            title="Drivers Activos"
            value={kpis.active_drivers}
            description={`Conductores activos actualmente`}
            icon={<Users className="h-6 w-6" />}
            variant="drivers"
          />
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <OrdersChart
          data={reportData?.orders_by_date?.map((item) => ({
            date: item.date,
            orders: item.count,
          })) || []}
          isLoading={isLoadingReport}
        />
        <RevenueChart
          data={reportData?.revenue_by_date || []}
          isLoading={isLoadingReport}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <StatusDistributionChart
          data={reportData?.orders_by_status || []}
          isLoading={isLoadingReport}
        />
        <TopProductsChart
          data={reportData?.top_products || []}
          isLoading={isLoadingReport}
        />
      </div>
    </div>
  );
}

