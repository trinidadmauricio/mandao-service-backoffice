'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { OrdersReportData } from '@/lib/hooks/use-reports';

interface OrdersChartProps {
  data?: OrdersReportData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function OrdersChart({ data }: OrdersChartProps) {
  // Validar que data existe
  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Órdenes por Fecha</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Preparar datos para gráficos
  const ordersByStatusData = Object.entries(data.summary?.orders_by_status || {}).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  // Agrupar órdenes por fecha para gráfico de líneas
  const ordersByDate = (data.orders || []).reduce((acc, order) => {
    const date = order.created_at.split('T')[0];
    if (!acc[date]) {
      acc[date] = { date, count: 0, revenue: 0 };
    }
    acc[date].count += 1;
    acc[date].revenue += order.total_amount || 0;
    return acc;
  }, {} as Record<string, { date: string; count: number; revenue: number }>);

  const ordersByDateArray = Object.values(ordersByDate).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Gráfico de Líneas - Órdenes por Fecha */}
      {ordersByDateArray.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Órdenes por Fecha</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ordersByDateArray}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8884d8" name="Órdenes" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de Barras - Revenue por Fecha */}
      {ordersByDateArray.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue por Fecha</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ordersByDateArray}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de Pastel - Órdenes por Estado */}
      {ordersByStatusData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ordersByStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ordersByStatusData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

