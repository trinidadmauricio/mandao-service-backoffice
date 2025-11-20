'use client';

import { useSubscriptionLimits } from '@/lib/hooks/use-subscriptions';
import { useTenant } from '@/lib/hooks/use-tenant';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChangePlanDialog } from '@/components/subscriptions/change-plan-dialog';
import { UsageLimitsCard } from '@/components/subscriptions/usage-limits-card';
import { StartTrialDialog } from '@/components/subscriptions/start-trial-dialog';
import { ConvertTrialDialog } from '@/components/subscriptions/convert-trial-dialog';
import { CreditCard } from 'lucide-react';

export default function SubscriptionSettingsPage() {
  const { data: limits, isLoading: isLoadingLimits } = useSubscriptionLimits();
  const { data: tenant, isLoading: isLoadingTenant } = useTenant();

  if (isLoadingLimits || isLoadingTenant) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando información de suscripción...</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard
      resource="subscriptions"
      action="read"
      fallback={<div>No tienes permisos para acceder a esta página</div>}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Suscripción</h1>
            <p className="text-muted-foreground mt-2">Gestiona tu plan de suscripción y límites</p>
          </div>
        </div>

        {/* Plan Actual */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Plan Actual</CardTitle>
              <div className="flex items-center space-x-2">
                {tenant?.subscription_status === 'TRIAL' && (
                  <ConvertTrialDialog currentPlanName={tenant.subscription_plan_id} />
                )}
                {!tenant?.subscription_plan_id && <StartTrialDialog />}
                {tenant?.subscription_status === 'ACTIVE' && <ChangePlanDialog />}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {tenant?.subscription_plan_id ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <CreditCard className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium text-lg">Plan ID: {tenant.subscription_plan_id}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {tenant.subscription_status === 'TRIAL' && (
                        <Badge variant="outline">
                          Período de Prueba
                        </Badge>
                      )}
                      {tenant.subscription_status === 'ACTIVE' && (
                        <Badge variant="default">
                          Activo
                        </Badge>
                      )}
                      {tenant.subscription_status === 'CANCELLED' && (
                        <Badge variant="destructive">
                          Cancelado
                        </Badge>
                      )}
                      {tenant.subscription_status === 'EXPIRED' && (
                        <Badge variant="outline">
                          Expirado
                        </Badge>
                      )}
                    </p>
                    {tenant.subscription_expires_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Expira: {new Date(tenant.subscription_expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No hay plan de suscripción activo</p>
            )}
          </CardContent>
        </Card>

        {/* Límites y Uso */}
        {limits && <UsageLimitsCard limits={limits} />}
      </div>
    </PermissionGuard>
  );
}
