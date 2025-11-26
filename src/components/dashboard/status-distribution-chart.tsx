'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

interface StatusDistributionData {
  status: string;
  count: number;
}

interface StatusDistributionChartProps {
  data?: StatusDistributionData[];
  isLoading?: boolean;
}

const COLORS = [
  'hsl(217, 91%, 60%)', // Primary blue
  'hsl(142, 76%, 36%)', // Success green
  'hsl(38, 92%, 50%)', // Warning amber
  'hsl(188, 94%, 43%)', // Info cyan
  'hsl(0, 84%, 60%)', // Destructive red
  'hsl(262, 83%, 58%)', // Purple
  'hsl(24, 95%, 53%)', // Orange
  'hsl(280, 100%, 70%)', // Pink
];

const statusLabels: Record<string, string> = {
  DRAFT: 'Borrador',
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  ASSIGNED: 'Asignada',
  IN_TRANSIT: 'En Tránsito',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
  FAILED: 'Fallida',
};

export function StatusDistributionChart({ data, isLoading }: StatusDistributionChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Órdenes por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Órdenes por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            variant="empty"
            title="No hay datos disponibles"
            description="No se encontraron órdenes para mostrar la distribución."
          />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    name: statusLabels[item.status] || item.status,
    value: item.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Órdenes por Estado</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

