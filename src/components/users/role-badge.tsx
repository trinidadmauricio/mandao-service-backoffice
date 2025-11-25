import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/lib/constants/roles';

interface RoleBadgeProps {
  role: UserRole;
}

const roleColors: Record<UserRole, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'> = {
  OWNER: 'default',
  SUPERVISOR: 'info',
  MERCHANT_USER: 'outline',
  CUSTOMER: 'outline',
};

const roleLabels: Record<UserRole, string> = {
  OWNER: 'Propietario',
  SUPERVISOR: 'Supervisor',
  MERCHANT_USER: 'Usuario',
  CUSTOMER: 'Cliente',
};

export function RoleBadge({ role }: RoleBadgeProps) {
  return <Badge variant={roleColors[role]}>{roleLabels[role]}</Badge>;
}

