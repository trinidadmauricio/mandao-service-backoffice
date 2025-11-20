'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
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
import type { InventoryReportData } from '@/lib/hooks/use-reports';

interface InventoryChartProps {
  data: InventoryReportData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function InventoryChart({ data }: InventoryChartProps) {
  // Agrupar productos por categoría
  const productsByCategory = data.products.reduce((acc, product) => {
    const category = product.category_name || 'Sin categoría';
    if (!acc[category]) {
      acc[category] = { category, count: 0, lowStock: 0 };
    }
    acc[category].count += 1;
    if (product.stock_quantity <= product.min_stock_level) {
      acc[category].lowStock += 1;
    }
    return acc;
  }, {} as Record<string, { category: string; count: number; lowStock: number }>);

  const categoryData = Object.values(productsByCategory);

  // Datos para gráfico de pastel (Stock Status)
  const stockStatusData = [
    {
      name: 'En Stock',
      value: data.products.filter((p) => p.stock_quantity > p.min_stock_level).length,
    },
    {
      name: 'Stock Bajo',
      value: data.summary.low_stock_count,
    },
    {
      name: 'Sin Stock',
      value: data.summary.out_of_stock_count,
    },
  ].filter((item) => item.value > 0);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Gráfico de Barras - Productos por Categoría */}
      {categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Productos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Total" />
                <Bar dataKey="lowStock" fill="#FF8042" name="Stock Bajo" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de Pastel - Estado de Stock */}
      {stockStatusData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Estado de Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stockStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stockStatusData.map((entry, index) => (
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

