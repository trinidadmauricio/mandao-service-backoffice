'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateVehicle, useUpdateVehicle, useVehicle } from '@/lib/hooks/use-vehicles';
import { useLogisticsProviders } from '@/lib/hooks/use-logistics-providers';
import { useDrivers } from '@/lib/hooks/use-drivers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

const vehicleSchema = z.object({
  logistics_provider_id: z.string().uuid().optional().or(z.literal('')),
  driver_id: z.string().uuid().optional().or(z.literal('')),
  vehicle_type: z.enum(['MOTORCYCLE', 'SEDAN', 'MINI_VAN', 'PANEL', 'TRUCK', 'PICKUP']),
  license_plate: z.string().min(1, 'La placa es requerida'),
  brand: z.string().min(1, 'La marca es requerida'),
  model: z.string().min(1, 'El modelo es requerido'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().min(1, 'El color es requerido'),
  insurance_policy: z.string().min(1, 'La póliza de seguro es requerida'),
  insurance_expires_at: z.string().min(1, 'La fecha de expiración del seguro es requerida'),
  last_maintenance_at: z.string().optional().or(z.literal('')),
  status: z.enum(['AVAILABLE', 'IN_SERVICE', 'MAINTENANCE', 'OUT_OF_SERVICE']).default('AVAILABLE'),
  specifications: z.record(z.unknown()).optional(),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface VehicleFormProps {
  vehicleId?: string;
}

export function VehicleForm({ vehicleId }: VehicleFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!vehicleId;
  const { data: vehicle, isLoading: isLoadingVehicle } = useVehicle(vehicleId || '');
  const { data: logisticsProviders } = useLogisticsProviders();
  const { data: drivers } = useDrivers();
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      status: 'AVAILABLE',
      vehicle_type: 'MOTORCYCLE',
    },
  });

  useEffect(() => {
    if (vehicle && isEditing) {
      setValue('logistics_provider_id', vehicle.logistics_provider_id || '');
      setValue('driver_id', vehicle.driver_id || '');
      setValue('vehicle_type', vehicle.vehicle_type);
      setValue('license_plate', vehicle.license_plate);
      setValue('brand', vehicle.brand);
      setValue('model', vehicle.model);
      setValue('year', vehicle.year);
      setValue('color', vehicle.color);
      setValue('insurance_policy', vehicle.insurance_policy);
      setValue('insurance_expires_at', vehicle.insurance_expires_at.split('T')[0]);
      setValue('last_maintenance_at', vehicle.last_maintenance_at?.split('T')[0] || '');
      setValue('status', vehicle.status);
      setValue('specifications', vehicle.specifications || {});
    }
  }, [vehicle, isEditing, setValue]);

  const onSubmit = async (data: VehicleFormData) => {
    try {
      const submitData = {
        ...data,
        logistics_provider_id: data.logistics_provider_id || undefined,
        driver_id: data.driver_id || undefined,
        last_maintenance_at: data.last_maintenance_at || undefined,
        specifications: data.specifications || {},
      };

      if (isEditing && vehicleId) {
        await updateVehicle.mutateAsync({
          id: vehicleId,
          data: submitData,
        });
        toast({
          title: 'Vehículo actualizado',
          description: 'El vehículo ha sido actualizado exitosamente.',
        });
      } else {
        await createVehicle.mutateAsync(submitData);
        toast({
          title: 'Vehículo creado',
          description: 'El vehículo ha sido creado exitosamente.',
        });
      }
      router.push('/vehicles');
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Hubo un error al guardar el vehículo.',
        variant: 'destructive',
      });
    }
  };

  if (isLoadingVehicle && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando vehículo...</p>
        </div>
      </div>
    );
  }

  const isPending = createVehicle.isPending || updateVehicle.isPending;

  const vehicleTypeLabels: Record<string, string> = {
    MOTORCYCLE: 'Motocicleta',
    SEDAN: 'Sedán',
    MINI_VAN: 'Mini Van',
    PANEL: 'Panel',
    TRUCK: 'Camión',
    PICKUP: 'Pickup',
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Vehículo' : 'Nuevo Vehículo'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Actualiza la información del vehículo'
            : 'Crea un nuevo vehículo en el sistema'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle_type">Tipo de Vehículo *</Label>
              <select
                id="vehicle_type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register('vehicle_type')}
                disabled={isPending}
              >
                {Object.entries(vehicleTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.vehicle_type && (
                <p className="text-sm text-destructive">{errors.vehicle_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_plate">Placa *</Label>
              <Input id="license_plate" {...register('license_plate')} disabled={isPending} />
              {errors.license_plate && (
                <p className="text-sm text-destructive">{errors.license_plate.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marca *</Label>
              <Input id="brand" {...register('brand')} disabled={isPending} />
              {errors.brand && (
                <p className="text-sm text-destructive">{errors.brand.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Modelo *</Label>
              <Input id="model" {...register('model')} disabled={isPending} />
              {errors.model && (
                <p className="text-sm text-destructive">{errors.model.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Año *</Label>
              <Input
                id="year"
                type="number"
                {...register('year', { valueAsNumber: true })}
                disabled={isPending}
              />
              {errors.year && (
                <p className="text-sm text-destructive">{errors.year.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Color *</Label>
              <Input id="color" {...register('color')} disabled={isPending} />
              {errors.color && (
                <p className="text-sm text-destructive">{errors.color.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado *</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register('status')}
                disabled={isPending}
              >
                <option value="AVAILABLE">Disponible</option>
                <option value="IN_SERVICE">En Servicio</option>
                <option value="MAINTENANCE">En Mantenimiento</option>
                <option value="OUT_OF_SERVICE">Fuera de Servicio</option>
              </select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="insurance_policy">Póliza de Seguro *</Label>
              <Input id="insurance_policy" {...register('insurance_policy')} disabled={isPending} />
              {errors.insurance_policy && (
                <p className="text-sm text-destructive">{errors.insurance_policy.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="insurance_expires_at">Fecha de Expiración del Seguro *</Label>
              <Input
                id="insurance_expires_at"
                type="date"
                {...register('insurance_expires_at')}
                disabled={isPending}
              />
              {errors.insurance_expires_at && (
                <p className="text-sm text-destructive">{errors.insurance_expires_at.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_maintenance_at">Última Mantención</Label>
            <Input
              id="last_maintenance_at"
              type="date"
              {...register('last_maintenance_at')}
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logistics_provider_id">Proveedor Logístico</Label>
              <select
                id="logistics_provider_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register('logistics_provider_id')}
                disabled={isPending}
              >
                <option value="">Sin proveedor</option>
                {logisticsProviders?.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.company_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver_id">Driver Asignado</Label>
              <select
                id="driver_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register('driver_id')}
                disabled={isPending}
              >
                <option value="">Sin driver</option>
                {drivers?.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.user?.first_name} {driver.user?.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

