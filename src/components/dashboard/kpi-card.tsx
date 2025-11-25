import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/currency';
import type { CurrencyCode } from '@/lib/utils/currency';
import { cn } from '@/lib/utils/cn';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  currency?: CurrencyCode;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'orders' | 'revenue' | 'average' | 'drivers';
}

const variantStyles = {
  default: 'bg-gradient-to-br from-primary/5 to-primary/10',
  orders: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20',
  revenue: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20',
  average: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20',
  drivers: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20',
};

const variantIconColors = {
  default: 'text-primary',
  orders: 'text-blue-600 dark:text-blue-400',
  revenue: 'text-emerald-600 dark:text-emerald-400',
  average: 'text-purple-600 dark:text-purple-400',
  drivers: 'text-orange-600 dark:text-orange-400',
};

export function KPICard({ title, value, description, currency, icon, trend, variant = 'default' }: KPICardProps) {
  const formattedValue =
    typeof value === 'number' && currency ? formatCurrency(value, currency) : value;

  return (
    <Card className={cn('overflow-hidden transition-all duration-200 hover:shadow-lg', variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && (
          <div className={cn('h-6 w-6 flex items-center justify-center', variantIconColors[variant])}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 text-success" />
            ) : (
              <TrendingDown className="h-3 w-3 text-destructive" />
            )}
            <p
              className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}% vs período anterior
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

