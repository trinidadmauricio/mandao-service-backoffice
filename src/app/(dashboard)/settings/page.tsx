'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { useTenant, useUpdateTenant } from '@/lib/hooks/use-tenant';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

const tenantSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  default_currency: z.string().length(3, 'El código de moneda debe tener 3 caracteres'),
  default_locale: z.string().min(2, 'El locale es requerido'),
});

type TenantFormData = z.infer<typeof tenantSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: tenant, isLoading } = useTenant(user?.tenant_id || '');
  const updateTenant = useUpdateTenant();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    values: tenant
      ? {
          name: tenant.name,
          default_currency: tenant.default_currency,
          default_locale: tenant.default_locale,
        }
      : undefined,
  });

  const onSubmit = async (data: TenantFormData) => {
    if (!tenant) return;

    setError(null);
    setSuccess(false);

    try {
      await updateTenant.mutateAsync({
        id: tenant.id,
        data,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la configuración');
    }
  };

  return (
    <PermissionGuard
      resource="tenants"
      action="update"
      fallback={<div>No tienes permisos para acceder a esta página</div>}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground mt-2">Gestiona la configuración de tu tenant</p>
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
              <CardTitle>Información General</CardTitle>
              <CardDescription>Actualiza la información básica de tu tenant</CardDescription>
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
                  <Label htmlFor="name">Nombre del Tenant</Label>
                  <Input id="name" {...register('name')} disabled={updateTenant.isPending} />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default_currency">Moneda por Defecto</Label>
                  <Input
                    id="default_currency"
                    maxLength={3}
                    placeholder="USD"
                    {...register('default_currency')}
                    disabled={updateTenant.isPending}
                  />
                  {errors.default_currency && (
                    <p className="text-sm text-destructive">{errors.default_currency.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default_locale">Idioma por Defecto</Label>
                  <Input
                    id="default_locale"
                    placeholder="es"
                    {...register('default_locale')}
                    disabled={updateTenant.isPending}
                  />
                  {errors.default_locale && (
                    <p className="text-sm text-destructive">{errors.default_locale.message}</p>
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
    </PermissionGuard>
  );
}

