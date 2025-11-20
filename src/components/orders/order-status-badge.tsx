import { Badge } from '@/components/ui/badge';
import type { Order } from '@/types/api';

interface OrderStatusBadgeProps {
  status: Order['status'];
}

const statusColors: Record<Order['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'outline',
  PENDING: 'secondary',
  CONFIRMED: 'default',
  ASSIGNED: 'default',
  IN_TRANSIT: 'default',
  DELIVERED: 'default',
  CANCELLED: 'destructive',
  FAILED: 'destructive',
};

const statusLabels: Record<Order['status'], string> = {
  DRAFT: 'Borrador',
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  ASSIGNED: 'Asignada',
  IN_TRANSIT: 'En Tránsito',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
  FAILED: 'Fallida',
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return <Badge variant={statusColors[status]}>{statusLabels[status]}</Badge>;
}

