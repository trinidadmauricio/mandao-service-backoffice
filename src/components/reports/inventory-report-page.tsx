'use client';

import { useState } from 'react';
import { useInventoryReport, type InventoryReportFilters } from '@/lib/hooks/use-reports';
import { useCategories } from '@/lib/hooks/use-categories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { InventoryChart } from './inventory-chart';

export function InventoryReportPage() {
  const [filters, setFilters] = useState<InventoryReportFilters>({});
  const { data: report, isLoading, error } = useInventoryReport(filters);
  const { data: categories } = useCategories();

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
          <p className="text-destructive">Error al generar el reporte de inventario.</p>
        </CardContent>
      </Card>
    );
  }

  const lowStockProducts = report?.products.filter(
    (product) => product.stock_quantity <= product.min_stock_level
  ) || [];

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category_id">Categoría</Label>
              <select
                id="category_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filters.category_id || ''}
                onChange={(e) =>
                  setFilters({ ...filters, category_id: e.target.value || undefined })
                }
              >
                <option value="">Todas las categorías</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="low_stock"
                  checked={filters.low_stock || false}
                  onChange={(e) =>
                    setFilters({ ...filters, low_stock: e.target.checked || undefined })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="low_stock" className="cursor-pointer">
                  Solo productos con stock bajo
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas de Stock Bajo */}
      {lowStockProducts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{lowStockProducts.length}</strong> productos tienen stock bajo o están
            agotados.
          </AlertDescription>
        </Alert>
      )}

      {/* Resumen */}
      {report?.summary && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.summary.total_products}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {report.summary.low_stock_count}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sin Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {report.summary.out_of_stock_count}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos */}
      {report && <InventoryChart data={report} />}

      {/* Tabla de Productos */}
      {report?.products && report.products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.products.map((product) => {
                const isLowStock = product.stock_quantity <= product.min_stock_level;
                const isOutOfStock = product.stock_quantity === 0;

                return (
                  <div
                    key={product.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      isOutOfStock ? 'border-destructive' : isLowStock ? 'border-yellow-500' : ''
                    }`}
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                      {product.category_name && (
                        <p className="text-xs text-muted-foreground">
                          Categoría: {product.category_name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">
                          Stock: {product.stock_quantity} / {product.min_stock_level}
                        </p>
                        {isOutOfStock && (
                          <Badge variant="destructive" className="mt-1">
                            Sin Stock
                          </Badge>
                        )}
                        {isLowStock && !isOutOfStock && (
                          <Badge variant="outline" className="mt-1 border-yellow-500 text-yellow-500">
                            Stock Bajo
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

