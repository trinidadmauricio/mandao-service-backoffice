'use client';

import { useTenant } from '@/lib/hooks/use-tenant';
import { useOrderCounter } from '@/lib/hooks/use-order-counters';
import { RoleGuard } from '@/components/auth/role-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderCounterForm } from '@/components/order-counters/order-counter-form';
import { IncrementCounterButton } from '@/components/order-counters/increment-counter-button';
import { Hash, Settings } from 'lucide-react';

export default function OrderCountersPage() {
  const { data: tenant } = useTenant();
  const tenantId = tenant?.id || '';
  const { data: counter, isLoading, error } = useOrderCounter(tenantId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando contador...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <RoleGuard
        allowedRoles={['OWNER', 'SUPERVISOR']}
        fallback={<div>No tienes permisos para acceder a esta página</div>}
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Contador de Órdenes</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona el contador para generar números de orden secuenciales
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Crear Contador</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                No hay un contador configurado. Crea uno para comenzar a generar números de orden.
              </p>
              <OrderCounterForm tenantId={tenantId} />
            </CardContent>
          </Card>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard
      allowedRoles={['OWNER', 'SUPERVISOR']}
      fallback={<div>No tienes permisos para acceder a esta página</div>}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Contador de Órdenes</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona el contador para generar números de orden secuenciales
            </p>
          </div>
        </div>

        {counter && (
          <>
            {/* Estado Actual */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Estado Actual</CardTitle>
                  <IncrementCounterButton tenantId={tenantId} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Hash className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Actual</p>
                    <p className="text-3xl font-bold">
                      {counter.prefix ? `${counter.prefix}-` : ''}
                      {String(counter.current_value).padStart(counter.padding_length, '0')}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Prefijo</p>
                    <p className="font-medium">{counter.prefix || 'Sin prefijo'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Longitud de Padding</p>
                    <p className="font-medium">{counter.padding_length} dígitos</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ejemplo de Próximo Número</p>
                  <p className="font-mono text-lg">
                    {counter.prefix ? `${counter.prefix}-` : ''}
                    {String(counter.current_value + 1).padStart(counter.padding_length, '0')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Configuración */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Configuración</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OrderCounterForm tenantId={tenantId} initialData={counter} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </RoleGuard>
  );
}

