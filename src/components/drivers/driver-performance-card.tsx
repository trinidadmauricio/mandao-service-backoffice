'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Package } from 'lucide-react';
import type { Driver } from '@/types/api';

interface DriverPerformanceCardProps {
  driver: Driver;
}

export function DriverPerformanceCard({ driver }: DriverPerformanceCardProps) {
  const rating = driver.rating_avg || 0;
  const totalDeliveries = driver.total_deliveries || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium">Calificación Promedio</span>
          </div>
          <Badge variant="default" className="text-lg">
            {rating.toFixed(1)} / 5.0
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium">Total de Entregas</span>
          </div>
          <Badge variant="secondary" className="text-lg">
            {totalDeliveries}
          </Badge>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Estado</span>
            <Badge
              variant={
                driver.availability_status === 'AVAILABLE'
                  ? 'default'
                  : driver.availability_status === 'BUSY'
                  ? 'secondary'
                  : driver.availability_status === 'OFFLINE'
                  ? 'outline'
                  : 'destructive'
              }
            >
              {driver.availability_status === 'AVAILABLE'
                ? 'Disponible'
                : driver.availability_status === 'BUSY'
                ? 'Ocupado'
                : driver.availability_status === 'OFFLINE'
                ? 'Desconectado'
                : 'Suspendido'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

