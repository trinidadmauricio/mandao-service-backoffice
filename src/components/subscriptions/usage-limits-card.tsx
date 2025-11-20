'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3 } from 'lucide-react';
import type { SubscriptionLimits } from '@/lib/hooks/use-subscriptions';

interface UsageLimitsCardProps {
  limits: SubscriptionLimits;
}

export function UsageLimitsCard({ limits }: UsageLimitsCardProps) {
  const productsPercentage = limits.max_products > 0
    ? (limits.current_products / limits.max_products) * 100
    : 0;
  const ordersPercentage = limits.max_orders_month > 0
    ? (limits.current_orders_month / limits.max_orders_month) * 100
    : 0;
  const branchesPercentage = limits.max_branches > 0
    ? (limits.current_branches / limits.max_branches) * 100
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <CardTitle>Límites y Uso</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Productos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Productos</span>
            <span className="text-sm text-muted-foreground">
              {limits.current_products} / {limits.max_products}
            </span>
          </div>
          <Progress value={productsPercentage} className="h-2" />
          {productsPercentage >= 90 && (
            <p className="text-xs text-destructive">
              ⚠️ Estás cerca del límite de productos
            </p>
          )}
        </div>

        {/* Órdenes del Mes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Órdenes del Mes</span>
            <span className="text-sm text-muted-foreground">
              {limits.current_orders_month} / {limits.max_orders_month}
            </span>
          </div>
          <Progress value={ordersPercentage} className="h-2" />
          {ordersPercentage >= 90 && (
            <p className="text-xs text-destructive">
              ⚠️ Estás cerca del límite de órdenes mensuales
            </p>
          )}
        </div>

        {/* Sucursales */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Sucursales</span>
            <span className="text-sm text-muted-foreground">
              {limits.current_branches} / {limits.max_branches}
            </span>
          </div>
          <Progress value={branchesPercentage} className="h-2" />
          {branchesPercentage >= 90 && (
            <p className="text-xs text-destructive">
              ⚠️ Estás cerca del límite de sucursales
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

