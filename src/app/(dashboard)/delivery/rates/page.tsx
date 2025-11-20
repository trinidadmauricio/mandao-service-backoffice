'use client';

import { RoleGuard } from '@/components/auth/role-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function DeliveryRatesPage() {
  return (
    <RoleGuard
      allowedRoles={['OWNER', 'SUPERVISOR']}
      fallback={<div>No tienes permisos para acceder a esta página</div>}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tarifas de Entrega</h1>
            <p className="text-muted-foreground mt-2">Gestiona las tarifas de entrega</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarifa
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Tarifas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Gestión de tarifas de entrega (pendiente implementar)
            </p>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}

