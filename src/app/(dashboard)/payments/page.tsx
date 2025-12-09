'use client';

import { RoleGuard } from '@/components/auth/role-guard';
import { TenantRequiredGuard } from '@/components/auth/tenant-required-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentsPage() {
  return (
    <TenantRequiredGuard>
      <RoleGuard
        allowedRoles={['OWNER', 'SUPERVISOR']}
        fallback={<div>No tienes permisos para acceder a esta página</div>}
      >
        <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pagos</h1>
          <p className="text-muted-foreground mt-2">Gestiona los pagos y transacciones</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transacciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Gestión de pagos (pendiente implementar)
            </p>
          </CardContent>
          </Card>
        </div>
      </RoleGuard>
    </TenantRequiredGuard>
  );
}

