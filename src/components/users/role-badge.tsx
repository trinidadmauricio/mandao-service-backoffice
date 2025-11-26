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
  LOGISTICS_PROVIDER: 'info',
  DRIVER: 'outline',
  SAAS_ADMIN: 'default',
  SAAS_EDITOR: 'secondary',
};

const roleLabels: Record<UserRole, string> = {
  OWNER: 'Propietario',
  SUPERVISOR: 'Supervisor',
  MERCHANT_USER: 'Usuario',
  CUSTOMER: 'Cliente',
  LOGISTICS_PROVIDER: 'Proveedor Logístico',
  DRIVER: 'Conductor',
  SAAS_ADMIN: 'Admin SAAS',
  SAAS_EDITOR: 'Editor SAAS',
};

export function RoleBadge({ role }: RoleBadgeProps) {
  return <Badge variant={roleColors[role]}>{roleLabels[role]}</Badge>;
}

