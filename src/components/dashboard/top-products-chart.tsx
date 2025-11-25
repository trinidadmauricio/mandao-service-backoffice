'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

interface TopProductsData {
  product_name: string;
  quantity: number;
  revenue: number;
}

interface TopProductsChartProps {
  data?: TopProductsData[];
  isLoading?: boolean;
}

export function TopProductsChart({ data, isLoading }: TopProductsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            variant="empty"
            title="No hay datos disponibles"
            description="No se encontraron productos vendidos para el período seleccionado."
          />
        </CardContent>
      </Card>
    );
  }

  // Limitar a top 10 productos
  const topProducts = data.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Productos Vendidos</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topProducts} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              dataKey="product_name"
              type="category"
              tick={{ fontSize: 12 }}
              width={150}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend />
            <Bar
              dataKey="quantity"
              fill="hsl(262, 83%, 58%)"
              name="Cantidad Vendida"
              radius={[0, 6, 6, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

