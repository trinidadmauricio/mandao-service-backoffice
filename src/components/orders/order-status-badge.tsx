import { Badge } from '@/components/ui/badge';
import type { Order } from '@/types/api';
import { FileText, Clock, CheckCircle, Truck, PackageCheck, XCircle, AlertCircle } from 'lucide-react';

interface OrderStatusBadgeProps {
  status: Order['status'];
  showIcon?: boolean;
}

const statusConfig: Record<
  Order['status'],
  { variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'; label: string; icon: React.ReactNode }
> = {
  DRAFT: {
    variant: 'outline',
    label: 'Borrador',
    icon: <FileText className="h-3 w-3" />,
  },
  PENDING: {
    variant: 'warning',
    label: 'Pendiente',
    icon: <Clock className="h-3 w-3" />,
  },
  CONFIRMED: {
    variant: 'info',
    label: 'Confirmada',
    icon: <CheckCircle className="h-3 w-3" />,
  },
  ASSIGNED: {
    variant: 'info',
    label: 'Asignada',
    icon: <Truck className="h-3 w-3" />,
  },
  IN_TRANSIT: {
    variant: 'default',
    label: 'En Tránsito',
    icon: <Truck className="h-3 w-3" />,
  },
  DELIVERED: {
    variant: 'success',
    label: 'Entregada',
    icon: <PackageCheck className="h-3 w-3" />,
  },
  CANCELLED: {
    variant: 'destructive',
    label: 'Cancelada',
    icon: <XCircle className="h-3 w-3" />,
  },
  FAILED: {
    variant: 'destructive',
    label: 'Fallida',
    icon: <AlertCircle className="h-3 w-3" />,
  },
};

export function OrderStatusBadge({ status, showIcon = true }: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant}>
      {showIcon && config.icon}
      {config.label}
    </Badge>
  );
}

