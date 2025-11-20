'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { useTenant, useUpdateTenant } from '@/lib/hooks/use-tenant';
import { RoleGuard } from '@/components/auth/role-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

const retailSettingsSchema = z.object({
  low_stock_threshold: z.number().int().min(0).default(10),
  allow_backorders: z.boolean().default(false),
  require_inventory_tracking: z.boolean().default(true),
  default_tax_rate: z.number().min(0).max(100).default(0),
});

type RetailSettingsFormData = z.infer<typeof retailSettingsSchema>;

export default function TenantRetailSettingsPage() {
  const { user } = useAuth();
  const { data: tenant, isLoading } = useTenant(user?.tenant_id || '');
  const updateTenant = useUpdateTenant();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RetailSettingsFormData>({
    resolver: zodResolver(retailSettingsSchema),
    defaultValues: {
      low_stock_threshold: 10,
      allow_backorders: false,
      require_inventory_tracking: true,
      default_tax_rate: 0,
    },
  });

  const onSubmit = async (data: RetailSettingsFormData) => {
    if (!tenant) return;

    setError(null);
    setSuccess(false);

    try {
      await updateTenant.mutateAsync({
        id: tenant.id,
        data: {
          settings: {
            ...(tenant.settings as Record<string, unknown> || {}),
            retail: data,
          },
        },
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
          <h1 className="text-3xl font-bold">Configuración de Retail</h1>
          <p className="text-muted-foreground mt-2">Configura las opciones de e-commerce</p>
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
              <CardTitle>Opciones de Retail</CardTitle>
              <CardDescription>Configura el comportamiento del catálogo y ventas</CardDescription>
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

                <div className="space-y-2">
                  <Label htmlFor="low_stock_threshold">Umbral de Stock Bajo</Label>
                  <Input
                    id="low_stock_threshold"
                    type="number"
                    min="0"
                    {...register('low_stock_threshold', { valueAsNumber: true })}
                    disabled={updateTenant.isPending}
                  />
                  {errors.low_stock_threshold && (
                    <p className="text-sm text-destructive">{errors.low_stock_threshold.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Cantidad mínima de stock antes de mostrar alerta
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allow_backorders"
                    {...register('allow_backorders', { valueAsNumber: false })}
                    disabled={updateTenant.isPending}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="allow_backorders" className="cursor-pointer">
                    Permitir pedidos sin stock (backorders)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="require_inventory_tracking"
                    {...register('require_inventory_tracking', { valueAsNumber: false })}
                    disabled={updateTenant.isPending}
                    className="h-4 w-4 rounded border-gray-300"
                    defaultChecked
                  />
                  <Label htmlFor="require_inventory_tracking" className="cursor-pointer">
                    Requerir seguimiento de inventario
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default_tax_rate">Tasa de Impuesto por Defecto (%)</Label>
                  <Input
                    id="default_tax_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    {...register('default_tax_rate', { valueAsNumber: true })}
                    disabled={updateTenant.isPending}
                  />
                  {errors.default_tax_rate && (
                    <p className="text-sm text-destructive">{errors.default_tax_rate.message}</p>
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

