'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateVehicle, useUpdateVehicle, useVehicle } from '@/lib/hooks/use-vehicles';
import { useLogisticsProviders } from '@/lib/hooks/use-logistics-providers';
import { useDrivers, useDriver } from '@/lib/hooks/use-drivers';
import { useAuth } from '@/lib/hooks/use-auth';
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
  const { user: currentUser, isLoading: isLoadingAuth } = useAuth();
  const isEditing = !!vehicleId;
  const { data: vehicle, isLoading: isLoadingVehicle } = useVehicle(vehicleId || '');
  
  // Determinar si el campo "Proveedor Logístico" debe estar oculto
  // LOGISTICS_PROVIDER y SUPERVISOR no deben ver este campo, ya que pertenecen a un proveedor específico
  const shouldHideLogisticsProviderField =
    currentUser &&
    (currentUser.role === USER_ROLE.LOGISTICS_PROVIDER ||
      currentUser.role === USER_ROLE.SUPERVISOR);
  
  // Solo llamar al API si:
  // 1. No está cargando la autenticación
  // 2. El usuario NO es LOGISTICS_PROVIDER ni SUPERVISOR
  // 3. El usuario existe (no es null/undefined)
  const shouldFetchLogisticsProviders = Boolean(
    !isLoadingAuth && 
    currentUser && 
    !shouldHideLogisticsProviderField
  );
  
  const { data: logisticsProviders } = useLogisticsProviders(
    undefined,
    { enabled: shouldFetchLogisticsProviders }
  );
  // Cargar todos los drivers disponibles para determinar qué proveedores tienen drivers disponibles
  const { data: allDrivers } = useDrivers({ availability_status: 'AVAILABLE' });
  
  // Cargar el driver asignado específicamente si existe (para incluirlo aunque no esté disponible)
  const { data: assignedDriver } = useDriver(vehicle?.driver_id || '');
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      status: 'AVAILABLE',
      vehicle_type: 'MOTORCYCLE',
      // Si el usuario es LOGISTICS_PROVIDER o SUPERVISOR, usar su logistics_provider_id automáticamente
      logistics_provider_id:
        shouldHideLogisticsProviderField && currentUser?.logistics_provider_id
          ? currentUser.logistics_provider_id
          : '',
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
  
  // Si estamos editando, usar el logistics_provider_id del vehículo si no hay uno seleccionado
  const providerIdForDrivers = selectedProviderId && selectedProviderId !== '' 
    ? selectedProviderId 
    : (isEditing && vehicle?.logistics_provider_id ? vehicle.logistics_provider_id : undefined);
  
  // Cargar drivers filtrados por proveedor cuando se selecciona uno
  // Si estamos editando y hay un driver asignado, no filtrar por availability_status para incluirlo
  const shouldFilterByAvailability = !(isEditing && vehicle?.driver_id);
  const { data: filteredDrivers } = useDrivers(
    providerIdForDrivers 
      ? { 
          logistics_provider_id: providerIdForDrivers, 
          ...(shouldFilterByAvailability ? { availability_status: 'AVAILABLE' } : {})
        } 
      : undefined
  );
  
  // Buscar el driver que tiene este vehicle_id si el vehículo no tiene driver_id
  const driverWithVehicle = useMemo(() => {
    if (isEditing && vehicle && !vehicle.driver_id && allDrivers?.data) {
      return allDrivers.data.find((d) => d.vehicle_id === vehicle.id);
    }
    return undefined;
  }, [isEditing, vehicle, allDrivers]);

  // Cargar el driver que tiene este vehicle_id si existe
  const { data: driverWithVehicleData } = useDriver(driverWithVehicle?.id || '');

  // Usar drivers filtrados si hay proveedor seleccionado o del vehículo, sino todos
  // Asegurar que el driver asignado siempre esté en la lista si existe
  const drivers = useMemo(() => {
    const baseDrivers = providerIdForDrivers ? filteredDrivers : allDrivers;
    
    // Si hay un driver asignado (desde vehicle.driver_id) y no está en la lista, agregarlo
    if (assignedDriver && baseDrivers?.data) {
      const driverExists = baseDrivers.data.some((d) => d.id === assignedDriver.id);
      if (!driverExists) {
        return {
          ...baseDrivers,
          data: [assignedDriver, ...baseDrivers.data],
        };
      }
    }
    
    // Si hay un driver que tiene este vehicle_id (cargado o encontrado) y no está en la lista, agregarlo
    const driverToAdd = driverWithVehicleData || driverWithVehicle;
    if (driverToAdd && baseDrivers?.data) {
      const driverExists = baseDrivers.data.some((d) => d.id === driverToAdd.id);
      if (!driverExists) {
        return {
          ...baseDrivers,
          data: [driverToAdd, ...baseDrivers.data],
        };
      }
    }
    
    return baseDrivers;
  }, [providerIdForDrivers, filteredDrivers, allDrivers, assignedDriver, driverWithVehicle, driverWithVehicleData]);

  // Filtrar proveedores para mostrar solo los que tienen drivers disponibles
  // El backend ya filtra por availability_status='AVAILABLE', así que todos los drivers aquí son disponibles
  const providersWithDrivers = useMemo(() => {
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

  // Establecer automáticamente el logistics_provider_id cuando se crea un nuevo vehículo
  // y el usuario es LOGISTICS_PROVIDER o SUPERVISOR
  useEffect(() => {
    if (!isEditing && shouldHideLogisticsProviderField && currentUser?.logistics_provider_id) {
      form.setValue('logistics_provider_id', currentUser.logistics_provider_id);
    }
  }, [isEditing, shouldHideLogisticsProviderField, currentUser, form]);

  // Limpiar driver seleccionado cuando cambia el proveedor (solo si no estamos en modo edición o si el driver no pertenece al nuevo proveedor)
  useEffect(() => {
    // No limpiar si estamos editando y acabamos de cargar el vehículo
    if (selectedProviderId && !isEditing) {
      // Verificar si el driver actual pertenece al proveedor seleccionado
      const currentDriverId = form.getValues('driver_id');
      if (currentDriverId) {
        // Buscar en la lista combinada de drivers (incluyendo el asignado)
        const currentDriver = drivers?.data?.find((d) => d.id === currentDriverId) || assignedDriver;
        if (currentDriver && currentDriver.logistics_provider_id !== selectedProviderId) {
          form.setValue('driver_id', '');
        }
      }
    }
  }, [selectedProviderId, form, drivers, assignedDriver, isEditing]);

  useEffect(() => {
    if (vehicle && isEditing) {
      // Si el vehículo no tiene driver_id, usar el driver que tiene este vehicle_id
      let driverIdToSet = vehicle.driver_id || '';
      
      if (!driverIdToSet) {
        // Buscar en allDrivers primero
        const driverWithThisVehicle = allDrivers?.data?.find(
          (driver) => driver.vehicle_id === vehicle.id
        );
        if (driverWithThisVehicle) {
          driverIdToSet = driverWithThisVehicle.id;
        } else if (driverWithVehicleData) {
          // Si no está en allDrivers pero lo cargamos con useDriver, usarlo
          driverIdToSet = driverWithVehicleData.id;
        }
      }
      
      // Si hay un driver asignado (assignedDriver), usarlo como prioridad
      if (assignedDriver && assignedDriver.id) {
        driverIdToSet = assignedDriver.id;
      }
      
      form.reset({
        logistics_provider_id: vehicle.logistics_provider_id || '',
        driver_id: driverIdToSet,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle, isEditing, allDrivers, driverWithVehicleData, assignedDriver]);

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
                    <Select
                      key={`vehicle-type-${field.value || 'empty'}`}
                      name={field.name}
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      disabled={isPending}
                    >
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
                    <Select
                      key={`status-${field.value || 'empty'}`}
                      name={field.name}
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      disabled={isPending}
                    >
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

            {/* Campo oculto para LOGISTICS_PROVIDER y SUPERVISOR */}
            {shouldHideLogisticsProviderField && (
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

            <div
              className={`grid grid-cols-1 ${
                shouldHideLogisticsProviderField ? 'md:grid-cols-1' : 'md:grid-cols-2'
              } gap-4`}
            >
              {!shouldHideLogisticsProviderField && (
                <FormField
                  control={form.control}
                  name="logistics_provider_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proveedor Logístico</FormLabel>
                      <Select
                        key={`logistics-provider-${logisticsProviders?.length || 0}-${field.value || 'empty'}`}
                        name={field.name}
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
              )}

              <FormField
                control={form.control}
                name="driver_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Driver Asignado</FormLabel>
                    <Select
                      key={`driver-${drivers?.data?.length || 0}-${field.value || 'empty'}-${assignedDriver?.id || 'no-assigned'}`}
                      name={field.name}
                      onValueChange={(value) => field.onChange(value || undefined)}
                      value={field.value || undefined}
                      disabled={isPending || (!providerIdForDrivers && !isEditing) || !drivers?.data?.length}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue 
                            placeholder={
                              (!providerIdForDrivers && !isEditing)
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

