'use client';

import { RoleGuard } from '@/components/auth/role-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function DeliveryZonesPage() {
  return (
    <RoleGuard
      allowedRoles={['OWNER', 'SUPERVISOR']}
      fallback={<div>No tienes permisos para acceder a esta página</div>}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Zonas de Entrega</h1>
            <p className="text-muted-foreground mt-2">Gestiona las zonas de entrega</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Zona
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Zonas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Gestión de zonas de entrega (pendiente implementar)
            </p>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}

