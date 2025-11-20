'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateDriver, useUpdateDriver, useDriver } from '@/lib/hooks/use-drivers';
import { useLogisticsProviders } from '@/lib/hooks/use-logistics-providers';
import { useUsers } from '@/lib/hooks/use-users';
import { useVehicles } from '@/lib/hooks/use-vehicles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

const driverSchema = z
  .object({
    logistics_provider_id: z.string().uuid('El proveedor logístico es requerido'),
    user_id: z.string().uuid('El usuario es requerido'),
    identity_document: z.string().min(1, 'El documento de identidad es requerido'),
    driving_license: z.string().min(1, 'La licencia de conducir es requerida'),
    date_of_birth: z.string().min(1, 'La fecha de nacimiento es requerida'),
    emergency_contact: z.object({
      name: z.string().min(1, 'El nombre del contacto de emergencia es requerido'),
      phone: z.string().min(1, 'El teléfono del contacto de emergencia es requerido'),
      relationship: z.string().optional(),
    }),
    has_own_vehicle: z.boolean().default(false),
    vehicle_id: z.string().uuid().optional().or(z.literal('')),
    work_type: z.enum(['FULL_TIME', 'PART_TIME', 'FREELANCE']),
    work_zone: z.string().optional(),
    availability_status: z.enum(['AVAILABLE', 'BUSY', 'OFFLINE', 'SUSPENDED']).default('AVAILABLE'),
    documents: z.record(z.unknown()).optional(),
  })
  .refine((data) => !data.has_own_vehicle || !!data.vehicle_id, {
    message: 'Debe seleccionar un vehículo si tiene vehículo propio',
    path: ['vehicle_id'],
  });

type DriverFormData = z.infer<typeof driverSchema>;

interface DriverFormProps {
  driverId?: string;
}

export function DriverForm({ driverId }: DriverFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!driverId;
  const { data: driver, isLoading: isLoadingDriver } = useDriver(driverId || '');
  const { data: logisticsProviders } = useLogisticsProviders();
  const { data: users } = useUsers();
  const { data: vehicles } = useVehicles();
  const createDriver = useCreateDriver();
  const updateDriver = useUpdateDriver();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      has_own_vehicle: false,
      availability_status: 'AVAILABLE',
      work_type: 'FULL_TIME',
      emergency_contact: {
        name: '',
        phone: '',
        relationship: '',
      },
    },
  });

  const hasOwnVehicle = watch('has_own_vehicle');

  useEffect(() => {
    if (driver && isEditing) {
      setValue('logistics_provider_id', driver.logistics_provider_id);
      setValue('user_id', driver.user_id);
      setValue('identity_document', driver.identity_document);
      setValue('driving_license', driver.driving_license);
      setValue('date_of_birth', driver.date_of_birth.split('T')[0]);
      setValue('emergency_contact', driver.emergency_contact as Record<string, unknown>);
      setValue('has_own_vehicle', driver.has_own_vehicle);
      setValue('vehicle_id', driver.vehicle_id || '');
      setValue('work_type', driver.work_type);
      setValue('work_zone', driver.work_zone || '');
      setValue('availability_status', driver.availability_status);
      setValue('documents', driver.documents || {});
    }
  }, [driver, isEditing, setValue]);

  const onSubmit = async (data: DriverFormData) => {
    try {
      const submitData = {
        ...data,
        vehicle_id: data.has_own_vehicle ? data.vehicle_id || undefined : undefined,
        documents: data.documents || {},
      };

      if (isEditing && driverId) {
        await updateDriver.mutateAsync({
          id: driverId,
          data: submitData,
        });
        toast({
          title: 'Driver actualizado',
          description: 'El driver ha sido actualizado exitosamente.',
        });
      } else {
        await createDriver.mutateAsync(submitData);
        toast({
          title: 'Driver creado',
          description: 'El driver ha sido creado exitosamente.',
        });
      }
      router.push('/drivers');
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Hubo un error al guardar el driver.',
        variant: 'destructive',
      });
    }
  };

  if (isLoadingDriver && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando driver...</p>
        </div>
      </div>
    );
  }

  const isPending = createDriver.isPending || updateDriver.isPending;

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Driver' : 'Nuevo Driver'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Actualiza la información del driver'
            : 'Crea un nuevo driver en el sistema'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logistics_provider_id">Proveedor Logístico *</Label>
              <select
                id="logistics_provider_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register('logistics_provider_id')}
                disabled={isPending}
              >
                <option value="">Selecciona un proveedor</option>
                {logisticsProviders?.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.company_name}
                  </option>
                ))}
              </select>
              {errors.logistics_provider_id && (
                <p className="text-sm text-destructive">{errors.logistics_provider_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_id">Usuario *</Label>
              <select
                id="user_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register('user_id')}
                disabled={isPending}
              >
                <option value="">Selecciona un usuario</option>
                {users?.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </option>
                ))}
              </select>
              {errors.user_id && (
                <p className="text-sm text-destructive">{errors.user_id.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="identity_document">Documento de Identidad *</Label>
              <Input id="identity_document" {...register('identity_document')} disabled={isPending} />
              {errors.identity_document && (
                <p className="text-sm text-destructive">{errors.identity_document.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="driving_license">Licencia de Conducir *</Label>
              <Input id="driving_license" {...register('driving_license')} disabled={isPending} />
              {errors.driving_license && (
                <p className="text-sm text-destructive">{errors.driving_license.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Fecha de Nacimiento *</Label>
            <Input
              id="date_of_birth"
              type="date"
              {...register('date_of_birth')}
              disabled={isPending}
            />
            {errors.date_of_birth && (
              <p className="text-sm text-destructive">{errors.date_of_birth.message}</p>
            )}
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-medium">Contacto de Emergencia</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Nombre *</Label>
                <Input
                  id="emergency_contact_name"
                  {...register('emergency_contact.name')}
                  disabled={isPending}
                />
                {errors.emergency_contact?.name && (
                  <p className="text-sm text-destructive">{errors.emergency_contact.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Teléfono *</Label>
                <Input
                  id="emergency_contact_phone"
                  {...register('emergency_contact.phone')}
                  disabled={isPending}
                />
                {errors.emergency_contact?.phone && (
                  <p className="text-sm text-destructive">{errors.emergency_contact.phone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_relationship">Relación</Label>
                <Input
                  id="emergency_contact_relationship"
                  {...register('emergency_contact.relationship')}
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="has_own_vehicle"
                {...register('has_own_vehicle')}
                disabled={isPending}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="has_own_vehicle" className="cursor-pointer">
                Tiene vehículo propio
              </Label>
            </div>
          </div>

          {hasOwnVehicle && (
            <div className="space-y-2">
              <Label htmlFor="vehicle_id">Vehículo *</Label>
              <select
                id="vehicle_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register('vehicle_id')}
                disabled={isPending}
              >
                <option value="">Selecciona un vehículo</option>
                {vehicles?.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.license_plate} - {vehicle.brand} {vehicle.model}
                  </option>
                ))}
              </select>
              {errors.vehicle_id && (
                <p className="text-sm text-destructive">{errors.vehicle_id.message}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="work_type">Tipo de Trabajo *</Label>
              <select
                id="work_type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register('work_type')}
                disabled={isPending}
              >
                <option value="FULL_TIME">Tiempo Completo</option>
                <option value="PART_TIME">Medio Tiempo</option>
                <option value="FREELANCE">Freelance</option>
              </select>
              {errors.work_type && (
                <p className="text-sm text-destructive">{errors.work_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability_status">Estado de Disponibilidad *</Label>
              <select
                id="availability_status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register('availability_status')}
                disabled={isPending}
              >
                <option value="AVAILABLE">Disponible</option>
                <option value="BUSY">Ocupado</option>
                <option value="OFFLINE">Desconectado</option>
                <option value="SUSPENDED">Suspendido</option>
              </select>
              {errors.availability_status && (
                <p className="text-sm text-destructive">{errors.availability_status.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="work_zone">Zona de Trabajo</Label>
            <Input id="work_zone" {...register('work_zone')} disabled={isPending} />
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

