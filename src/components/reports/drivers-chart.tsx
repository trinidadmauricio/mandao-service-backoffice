'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DriversReportData } from '@/lib/hooks/use-reports';

interface DriversChartProps {
  data: DriversReportData;
}

export function DriversChart({ data }: DriversChartProps) {
  // Preparar datos para gráficos
  const driversData = (data.drivers || [])
    .sort((a, b) => b.total_deliveries - a.total_deliveries)
    .slice(0, 10) // Top 10 drivers
    .map((driver) => ({
      name: driver.name.split(' ')[0], // Solo primer nombre para el gráfico
      deliveries: driver.total_deliveries,
      rating: driver.rating_avg || 0,
      revenue: driver.total_revenue,
    }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Gráfico de Barras - Entregas por Driver */}
      {driversData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Drivers - Entregas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={driversData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="deliveries" fill="#8884d8" name="Entregas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de Líneas - Rating por Driver */}
      {driversData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rating por Driver</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={driversData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="#8884d8"
                  name="Rating"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

