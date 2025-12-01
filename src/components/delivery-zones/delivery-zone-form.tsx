'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateDeliveryZone, useUpdateDeliveryZone, useDeliveryZone } from '@/lib/hooks/use-delivery-zones';
import { useAuth } from '@/lib/hooks/use-auth';
import { useTenants } from '@/lib/hooks/use-tenants';
import { USER_ROLE } from '@/lib/constants/roles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

// Schema dinámico según el rol del usuario
const createDeliveryZoneSchema = (isLogisticsProviderRole: boolean) => {
  if (isLogisticsProviderRole) {
    return z.object({
      logistics_provider_id: z.string().uuid('El proveedor logístico es requerido'),
      name: z.string().min(1, 'El nombre es requerido'),
      boundary: z.string().min(1, 'El boundary (WKT) es requerido'),
      base_rate: z.number().min(0, 'La tarifa base debe ser mayor o igual a 0'),
      rate_per_km: z.number().min(0, 'La tarifa por km debe ser mayor o igual a 0'),
      surge_multiplier: z.number().min(0).max(10).optional(),
      currency: z.string().length(3, 'El código de moneda debe tener 3 caracteres').default('USD'),
      is_active: z.boolean().default(true),
    });
  } else {
    return z.object({
      tenant_id: z.string().uuid('El tenant es requerido'),
      name: z.string().min(1, 'El nombre es requerido'),
      boundary: z.string().min(1, 'El boundary (WKT) es requerido'),
      base_rate: z.number().min(0, 'La tarifa base debe ser mayor o igual a 0'),
      rate_per_km: z.number().min(0, 'La tarifa por km debe ser mayor o igual a 0'),
      surge_multiplier: z.number().min(0).max(10).optional(),
      currency: z.string().length(3, 'El código de moneda debe tener 3 caracteres').default('USD'),
      is_active: z.boolean().default(true),
    });
  }
};

type DeliveryZoneFormData = z.infer<typeof deliveryZoneSchema>;

interface DeliveryZoneFormProps {
  zoneId?: string;
}

export function DeliveryZoneForm({ zoneId }: DeliveryZoneFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { data: tenants } = useTenants();
  const isEditing = !!zoneId;
  const { data: zone, isLoading: isLoadingZone } = useDeliveryZone(zoneId || '');
  const createZone = useCreateDeliveryZone();
  const updateZone = useUpdateDeliveryZone();

  // Determinar el tipo de rol del usuario
  const isLogisticsProviderRole =
    currentUser &&
    (currentUser.role === USER_ROLE.LOGISTICS_PROVIDER || currentUser.role === USER_ROLE.SUPERVISOR);
  const isTenantRole =
    currentUser &&
    (currentUser.role === USER_ROLE.SAAS_ADMIN ||
      currentUser.role === USER_ROLE.SAAS_EDITOR ||
      currentUser.role === USER_ROLE.OWNER);

  // Crear schema dinámico según el rol
  const deliveryZoneSchema = createDeliveryZoneSchema(!!isLogisticsProviderRole);
  type DeliveryZoneFormData = z.infer<typeof deliveryZoneSchema>;

  const form = useForm<DeliveryZoneFormData>({
    resolver: zodResolver(deliveryZoneSchema),
    defaultValues: {
      currency: 'USD',
      is_active: true,
      name: '',
      boundary: '',
      base_rate: 0,
      rate_per_km: 0,
      surge_multiplier: undefined,
      // Si es LOGISTICS_PROVIDER/SUPERVISOR, auto-poblar logistics_provider_id
      ...(isLogisticsProviderRole && currentUser?.logistics_provider_id
        ? { logistics_provider_id: currentUser.logistics_provider_id }
        : {}),
      // Si es OWNER, auto-poblar tenant_id
      ...(currentUser?.role === USER_ROLE.OWNER && currentUser?.tenant_id
        ? { tenant_id: currentUser.tenant_id }
        : {}),
    },
  });

  // Establecer automáticamente el campo apropiado cuando se crea un nuevo recurso
  useEffect(() => {
    if (!isEditing) {
      if (isLogisticsProviderRole && currentUser?.logistics_provider_id) {
        form.setValue('logistics_provider_id', currentUser.logistics_provider_id);
      } else if (currentUser?.role === USER_ROLE.OWNER && currentUser?.tenant_id) {
        form.setValue('tenant_id', currentUser.tenant_id);
      }
    }
  }, [isEditing, isLogisticsProviderRole, currentUser, form]);

  useEffect(() => {
    if (zone && isEditing) {
      form.reset({
        name: zone.name,
        boundary: zone.boundary,
        base_rate: zone.base_rate,
        rate_per_km: zone.rate_per_km,
        surge_multiplier: zone.surge_multiplier,
        currency: zone.currency,
        is_active: zone.is_active,
        // Incluir el campo apropiado según el tipo de zona
        ...(zone.logistics_provider_id
          ? { logistics_provider_id: zone.logistics_provider_id }
          : {}),
        ...(zone.tenant_id ? { tenant_id: zone.tenant_id } : {}),
      });
    }
  }, [zone, isEditing, form]);

  const onSubmit = async (data: DeliveryZoneFormData) => {
    try {
      const submitData = {
        ...data,
        surge_multiplier: data.surge_multiplier || undefined,
      };

      if (isEditing && zoneId) {
        await updateZone.mutateAsync({
          id: zoneId,
          data: submitData,
        });
        toast({
          title: 'Zona de entrega actualizada',
          description: 'La zona de entrega ha sido actualizada exitosamente.',
        });
      } else {
        await createZone.mutateAsync(submitData);
        toast({
          title: 'Zona de entrega creada',
          description: 'La zona de entrega ha sido creada exitosamente.',
        });
      }
      router.push('/delivery-zones');
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Hubo un error al guardar la zona de entrega.',
        variant: 'destructive',
      });
    }
  };

  if (isLoadingZone && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando zona de entrega...</p>
        </div>
      </div>
    );
  }

  const isPending = createZone.isPending || updateZone.isPending;

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Zona de Entrega' : 'Nueva Zona de Entrega'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Actualiza la información de la zona de entrega'
            : 'Crea una nueva zona de entrega en el sistema'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Campo oculto para LOGISTICS_PROVIDER y SUPERVISOR */}
            {isLogisticsProviderRole && (
              <FormField
                control={form.control}
                name="logistics_provider_id"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input type="hidden" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {/* Campo tenant_id para SAAS_ADMIN, SAAS_EDITOR y OWNER */}
            {isTenantRole && (
              <FormField
                control={form.control}
                name="tenant_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tenant *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending || currentUser?.role === USER_ROLE.OWNER}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tenant" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tenants?.map((tenant) => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="boundary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Boundary (WKT) *{' '}
                    <span className="text-xs text-muted-foreground">
                      (Formato: POLYGON((lng1 lat1, lng2 lat2, ...)))
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isPending}
                      className="font-mono"
                      placeholder="POLYGON((-58.3816 -34.6037, -58.3826 -34.6047, -58.3836 -34.6057, -58.3816 -34.6037))"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="base_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tarifa Base *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        disabled={isPending}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rate_per_km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tarifa por Kilómetro *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        disabled={isPending}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="surge_multiplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Multiplicador de Surge (0-10)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        disabled={isPending}
                        {...field}
                        value={field.value || ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moneda *</FormLabel>
                    <FormControl>
                      <Input maxLength={3} placeholder="USD" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Zona activa</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

