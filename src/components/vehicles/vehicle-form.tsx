'use client';

import { useEffect } from 'react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateVehicle, useUpdateVehicle, useVehicle } from '@/lib/hooks/use-vehicles';
import { useLogisticsProviders } from '@/lib/hooks/use-logistics-providers';
import { useDrivers } from '@/lib/hooks/use-drivers';
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
  // Cargar todos los drivers disponibles para determinar qué proveedores tienen drivers disponibles
  const { data: allDrivers } = useDrivers({ availability_status: 'AVAILABLE' });
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      status: 'AVAILABLE',
      vehicle_type: 'MOTORCYCLE',
      logistics_provider_id: '',
      driver_id: '',
      license_plate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      insurance_policy: '',
      insurance_expires_at: '',
      last_maintenance_at: '',
      specifications: {},
    },
  });

  // Obtener el proveedor seleccionado del formulario
  const selectedProviderId = form.watch('logistics_provider_id');
  
  // Cargar drivers filtrados por proveedor cuando se selecciona uno (solo disponibles)
  const { data: filteredDrivers } = useDrivers(
    selectedProviderId ? { logistics_provider_id: selectedProviderId, availability_status: 'AVAILABLE' } : undefined
  );
  
  // Usar drivers filtrados si hay proveedor seleccionado, sino todos
  const drivers = selectedProviderId ? filteredDrivers : allDrivers;

  // Filtrar proveedores para mostrar solo los que tienen drivers disponibles
  // El backend ya filtra por availability_status='AVAILABLE', así que todos los drivers aquí son disponibles
  const providersWithDrivers = React.useMemo(() => {
    if (!logisticsProviders || !allDrivers?.data) return [];
    
    // Obtener IDs de proveedores que tienen drivers disponibles
    const providerIdsWithAvailableDrivers = new Set(
      allDrivers.data
        .map((driver) => driver.logistics_provider_id)
        .filter((id): id is string => !!id)
    );
    
    return logisticsProviders.filter((provider) => 
      providerIdsWithAvailableDrivers.has(provider.id)
    );
  }, [logisticsProviders, allDrivers]);

  // Limpiar driver seleccionado cuando cambia el proveedor
  useEffect(() => {
    if (selectedProviderId) {
      // Verificar si el driver actual pertenece al proveedor seleccionado
      const currentDriverId = form.getValues('driver_id');
      if (currentDriverId) {
        const currentDriver = allDrivers?.data?.find((d) => d.id === currentDriverId);
        if (currentDriver && currentDriver.logistics_provider_id !== selectedProviderId) {
          form.setValue('driver_id', '');
        }
      }
    }
  }, [selectedProviderId, form, allDrivers]);

  useEffect(() => {
    if (vehicle && isEditing) {
      form.reset({
        logistics_provider_id: vehicle.logistics_provider_id || '',
        driver_id: vehicle.driver_id || '',
        vehicle_type: vehicle.vehicle_type,
        license_plate: vehicle.license_plate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        insurance_policy: vehicle.insurance_policy,
        insurance_expires_at: vehicle.insurance_expires_at.split('T')[0],
        last_maintenance_at: vehicle.last_maintenance_at?.split('T')[0] || '',
        status: vehicle.status,
        specifications: vehicle.specifications || {},
      });
    }
  }, [vehicle, isEditing, form]);

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vehicle_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Vehículo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(vehicleTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="license_plate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa *</FormLabel>
                    <FormControl>
                      <Input disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca *</FormLabel>
                    <FormControl>
                      <Input disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo *</FormLabel>
                    <FormControl>
                      <Input disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled={isPending}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color *</FormLabel>
                    <FormControl>
                      <Input disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Disponible</SelectItem>
                        <SelectItem value="IN_SERVICE">En Servicio</SelectItem>
                        <SelectItem value="MAINTENANCE">En Mantenimiento</SelectItem>
                        <SelectItem value="OUT_OF_SERVICE">Fuera de Servicio</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="insurance_policy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Póliza de Seguro *</FormLabel>
                    <FormControl>
                      <Input disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="insurance_expires_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Expiración del Seguro *</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="last_maintenance_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Última Mantención</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      disabled={isPending}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="logistics_provider_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proveedor Logístico</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value || undefined)}
                      value={field.value || undefined}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sin proveedor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {providersWithDrivers.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="driver_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Driver Asignado</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value || undefined)}
                      value={field.value || undefined}
                      disabled={isPending || !selectedProviderId || !drivers?.data?.length}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue 
                            placeholder={
                              !selectedProviderId 
                                ? 'Selecciona un proveedor primero' 
                                : !drivers?.data?.length 
                                ? 'No hay drivers disponibles' 
                                : 'Sin driver'
                            } 
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.isArray(drivers?.data) && drivers.data.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.user?.first_name} {driver.user?.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

