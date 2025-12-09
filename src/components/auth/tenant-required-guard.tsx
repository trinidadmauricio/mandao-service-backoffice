'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { useSelectedTenant } from '@/lib/hooks/use-selected-tenant';
import { USER_ROLE } from '@/lib/constants/roles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

interface TenantRequiredGuardProps {
  children: React.ReactNode;
}

/**
 * Componente que muestra un mensaje para seleccionar tenant
 * cuando el usuario es SAAS_ADMIN o SAAS_EDITOR y no ha seleccionado un tenant.
 * Para otros roles, muestra el contenido directamente.
 */
export function TenantRequiredGuard({ children }: TenantRequiredGuardProps) {
  const { user, isLoading } = useAuth();
  const { selectedTenantId } = useSelectedTenant();

  const isSAASAdmin = user && (user.role === USER_ROLE.SAAS_ADMIN || user.role === USER_ROLE.SAAS_EDITOR);

  // Mientras carga el auth, mostrar loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si es SAAS_ADMIN y no ha seleccionado un tenant, mostrar mensaje
  if (isSAASAdmin && !selectedTenantId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Selecciona un Tenant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Para ver los datos de esta sección, por favor selecciona un tenant desde el selector en la parte superior.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

