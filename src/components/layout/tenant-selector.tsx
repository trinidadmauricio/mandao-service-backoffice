'use client';

import { useSelectedTenant } from '@/lib/hooks/use-selected-tenant';
import { useTenants } from '@/lib/hooks/use-tenants';
import { Building2 } from 'lucide-react';

export function TenantSelector() {
  const { selectedTenantId, setSelectedTenantId } = useSelectedTenant();
  const { data: tenants, isLoading } = useTenants();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>Cargando...</span>
      </div>
    );
  }

  if (!tenants || tenants.length === 0) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>No hay tenants disponibles</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <select
        value={selectedTenantId || ''}
        onChange={(e) => setSelectedTenantId(e.target.value || null)}
        className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option value="">Seleccionar tenant...</option>
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name}
          </option>
        ))}
      </select>
    </div>
  );
}

