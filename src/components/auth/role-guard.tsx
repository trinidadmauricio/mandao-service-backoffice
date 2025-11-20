'use client';

import { ReactNode } from 'react';
import { usePermissions } from '@/lib/hooks/use-permissions';
import type { UserRole } from '@/lib/constants/roles';
import type { Permission } from '@/lib/constants/roles';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: {
    resource: string;
    action: Permission['action'];
  };
  fallback?: ReactNode;
}

export function RoleGuard({
  children,
  allowedRoles,
  requiredPermission,
  fallback = null,
}: RoleGuardProps) {
  const { role, hasPermission } = usePermissions();

  // Si no hay rol, no mostrar nada
  if (!role) {
    return <>{fallback}</>;
  }

  // Si hay roles permitidos, verificar que el rol actual esté en la lista
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  // Si hay permiso requerido, verificar que el usuario lo tenga
  if (requiredPermission && !hasPermission(requiredPermission.resource, requiredPermission.action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

