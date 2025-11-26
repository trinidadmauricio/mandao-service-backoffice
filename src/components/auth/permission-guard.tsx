'use client';

import { ReactNode } from 'react';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { useTenant } from '@/lib/hooks/use-tenant';
import { USER_ROLE } from '@/lib/constants/roles';
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
  const { hasPermission, role } = usePermissions();
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
  if (allowedTenantTypes) {
    // SAAS roles pueden acceder a todo sin restricciones de tenant type
    if (role === USER_ROLE.SAAS_ADMIN || role === USER_ROLE.SAAS_EDITOR) {
      // Permitir acceso
    }
    // LOGISTICS_PROVIDER y SUPERVISOR no tienen tenant, no deben acceder a módulos de catálogo
    else if (role === USER_ROLE.LOGISTICS_PROVIDER || role === USER_ROLE.SUPERVISOR) {
      // Si requiere RETAIL, no permitir (LOGISTICS_PROVIDER no tiene catálogo)
      if (allowedTenantTypes.includes('RETAIL') && !allowedTenantTypes.includes('ON_DEMAND')) {
        return (
          fallback || (
            <div>
              Esta funcionalidad solo está disponible para tenants de tipo: {allowedTenantTypes.join(', ')}
            </div>
          )
        );
      }
    }
    // Otros roles: validar tenant type
    else if (tenant) {
      const tenantType = tenant.type;
      if (!allowedTenantTypes.includes(tenantType)) {
        return (
          fallback || (
            <div>
              Esta funcionalidad solo está disponible para tenants de tipo: {allowedTenantTypes.join(', ')}
            </div>
          )
        );
      }
    } else {
      // Si no hay tenant y requiere un tipo específico, no permitir
      return (
        fallback || (
          <div>
            Esta funcionalidad requiere un tenant de tipo: {allowedTenantTypes.join(', ')}
          </div>
        )
      );
    }
  }

  return <>{children}</>;
}

