'use client';

import { ReactNode } from 'react';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { useTenant, type Tenant } from '@/lib/hooks/use-tenant';
import type { Permission } from '@/lib/constants/roles';

interface PermissionGuardProps {
  resource: string;
  action: Permission['action'];
  allowedTenantTypes?: ('RETAIL' | 'ON_DEMAND' | 'HYBRID')[];
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Componente que protege contenido basado en permisos y tipo de tenant
 */
export function PermissionGuard({
  resource,
  action,
  allowedTenantTypes,
  fallback,
  children,
}: PermissionGuardProps) {
  const { hasPermission } = usePermissions();
  const { tenant, isLoading: tenantLoading } = useTenant();

  // Si está cargando el tenant, no mostrar nada
  if (tenantLoading) {
    return null;
  }

  // Verificar permiso
  if (!hasPermission(resource, action)) {
    return fallback || <div>No tienes permisos para acceder a este recurso</div>;
  }

  // Verificar tipo de tenant si se especifica
  if (allowedTenantTypes && tenant) {
    const tenantData = tenant as unknown as Tenant;
    if (!allowedTenantTypes.includes(tenantData.type)) {
      return (
        fallback || (
          <div>
            Esta funcionalidad solo está disponible para tenants de tipo: {allowedTenantTypes.join(', ')}
          </div>
        )
      );
    }
  }

  return <>{children}</>;
}

