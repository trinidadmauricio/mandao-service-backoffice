'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { useTenant, useUpdateTenant, type Tenant } from '@/lib/hooks/use-tenant';
import { RoleGuard } from '@/components/auth/role-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

const deliverySettingsSchema = z.object({
  default_delivery_zone_id: z.string().uuid().optional(),
  auto_assign_driver: z.boolean().default(false),
  require_delivery_proof: z.boolean().default(true),
  default_delivery_time_minutes: z.number().int().min(15).max(480).default(60),
});

type DeliverySettingsFormData = z.infer<typeof deliverySettingsSchema>;

export default function TenantDeliverySettingsPage() {
  const { user } = useAuth();
  const { tenant, isLoading } = useTenant(user?.tenant_id || '');
  const updateTenant = useUpdateTenant();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeliverySettingsFormData>({
    resolver: zodResolver(deliverySettingsSchema),
    defaultValues: {
      auto_assign_driver: false,
      require_delivery_proof: true,
      default_delivery_time_minutes: 60,
    },
  });

  const onSubmit = async (data: DeliverySettingsFormData) => {
    if (!tenant) return;

    setError(null);
    setSuccess(false);

    if (!tenant) return;
    
    const tenantData = tenant as unknown as Tenant;
    
    try {
      await updateTenant.mutateAsync({
        id: tenantData.id,
        data: {
          settings: {
            ...(tenantData.settings as Record<string, unknown> || {}),
            delivery: data,
          },
        } as any,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la configuración');
    }
  };

  return (
    <RoleGuard allowedRoles={['OWNER']} fallback={<div>No tienes permisos para acceder a esta página</div>}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configuración de Delivery</h1>
          <p className="text-muted-foreground mt-2">Configura las opciones de entrega</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando configuración...</p>
            </div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Opciones de Delivery</CardTitle>
              <CardDescription>Configura el comportamiento del sistema de entregas</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-600">
                    Configuración actualizada exitosamente
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto_assign_driver"
                    {...register('auto_assign_driver', { valueAsNumber: false })}
                    disabled={updateTenant.isPending}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="auto_assign_driver" className="cursor-pointer">
                    Asignar driver automáticamente
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="require_delivery_proof"
                    {...register('require_delivery_proof', { valueAsNumber: false })}
                    disabled={updateTenant.isPending}
                    className="h-4 w-4 rounded border-gray-300"
                    defaultChecked
                  />
                  <Label htmlFor="require_delivery_proof" className="cursor-pointer">
                    Requerir prueba de entrega
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default_delivery_time_minutes">
                    Tiempo de Entrega por Defecto (minutos)
                  </Label>
                  <Input
                    id="default_delivery_time_minutes"
                    type="number"
                    min="15"
                    max="480"
                    {...register('default_delivery_time_minutes', { valueAsNumber: true })}
                    disabled={updateTenant.isPending}
                  />
                  {errors.default_delivery_time_minutes && (
                    <p className="text-sm text-destructive">
                      {errors.default_delivery_time_minutes.message}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={updateTenant.isPending}>
                  {updateTenant.isPending ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}

