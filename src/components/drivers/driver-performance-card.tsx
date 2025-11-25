"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Package, CheckCircle, Clock, XCircle } from "lucide-react";
import type { Driver } from "@/types/api";

interface DriverPerformanceCardProps {
  driver: Driver;
}

const statusConfig = {
  AVAILABLE: {
    variant: "success" as const,
    label: "Disponible",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  BUSY: {
    variant: "warning" as const,
    label: "Ocupado",
    icon: <Clock className="h-4 w-4" />,
  },
  OFFLINE: {
    variant: "outline" as const,
    label: "Desconectado",
    icon: <XCircle className="h-4 w-4" />,
  },
  SUSPENDED: {
    variant: "destructive" as const,
    label: "Suspendido",
    icon: <XCircle className="h-4 w-4" />,
  },
};

export function DriverPerformanceCard({ driver }: DriverPerformanceCardProps) {
  const rating = driver.rating_avg || 0;
  const totalDeliveries = driver.total_deliveries || 0;
  const status = driver.availability_status || "OFFLINE";
  const statusInfo =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.OFFLINE;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle>Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-lg bg-background/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <span className="text-sm font-medium">Calificación Promedio</span>
              <p className="text-xs text-muted-foreground">
                Basada en entregas completadas
              </p>
            </div>
          </div>
          <Badge variant="default" className="text-lg px-3 py-1">
            {rating.toFixed(1)} / 5.0
          </Badge>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-background/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <span className="text-sm font-medium">Total de Entregas</span>
              <p className="text-xs text-muted-foreground">
                Entregas completadas
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {totalDeliveries}
          </Badge>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
            <span className="text-sm font-medium text-muted-foreground">
              Estado Actual
            </span>
            <Badge
              variant={statusInfo.variant}
              className="flex items-center gap-1.5"
            >
              {statusInfo.icon}
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
