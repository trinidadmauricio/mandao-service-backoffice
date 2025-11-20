'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateBranch, useUpdateBranch, useBranch } from '@/lib/hooks/use-branches';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

const branchSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  address: z.string().min(1, 'La dirección es requerida'),
  gps_lat: z.number().min(-90).max(90, 'La latitud debe estar entre -90 y 90'),
  gps_lng: z.number().min(-180).max(180, 'La longitud debe estar entre -180 y 180'),
  contact_phone: z.string().min(1, 'El teléfono de contacto es requerido'),
  is_main: z.boolean().default(false),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  operating_hours: z.record(z.unknown()).optional(),
});

type BranchFormData = z.infer<typeof branchSchema>;

interface BranchFormProps {
  branchId?: string;
}

export function BranchForm({ branchId }: BranchFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!branchId;
  const { data: branch, isLoading: isLoadingBranch } = useBranch(branchId || '');
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      is_main: false,
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (branch && isEditing) {
      setValue('name', branch.name);
      setValue('address', branch.address);
      setValue('gps_lat', branch.gps_lat);
      setValue('gps_lng', branch.gps_lng);
      setValue('contact_phone', branch.contact_phone);
      setValue('is_main', branch.is_main);
      setValue('status', branch.status);
      setValue('operating_hours', branch.operating_hours || {});
    }
  }, [branch, isEditing, setValue]);

  const onSubmit = async (data: BranchFormData) => {
    try {
      if (isEditing && branchId) {
        await updateBranch.mutateAsync({
          id: branchId,
          data,
        });
        toast({
          title: 'Sucursal actualizada',
          description: 'La sucursal ha sido actualizada exitosamente.',
        });
      } else {
        await createBranch.mutateAsync(data);
        toast({
          title: 'Sucursal creada',
          description: 'La sucursal ha sido creada exitosamente.',
        });
      }
      router.push('/branches');
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Hubo un error al guardar la sucursal.',
        variant: 'destructive',
      });
    }
  };

  if (isLoadingBranch && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando sucursal...</p>
        </div>
      </div>
    );
  }

  const isPending = createBranch.isPending || updateBranch.isPending;

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Sucursal' : 'Nueva Sucursal'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Actualiza la información de la sucursal'
            : 'Crea una nueva sucursal en el sistema'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" {...register('name')} disabled={isPending} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección *</Label>
            <textarea
              id="address"
              {...register('address')}
              disabled={isPending}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gps_lat">Latitud GPS *</Label>
              <Input
                id="gps_lat"
                type="number"
                step="any"
                {...register('gps_lat', { valueAsNumber: true })}
                disabled={isPending}
              />
              {errors.gps_lat && (
                <p className="text-sm text-destructive">{errors.gps_lat.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gps_lng">Longitud GPS *</Label>
              <Input
                id="gps_lng"
                type="number"
                step="any"
                {...register('gps_lng', { valueAsNumber: true })}
                disabled={isPending}
              />
              {errors.gps_lng && (
                <p className="text-sm text-destructive">{errors.gps_lng.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_phone">Teléfono de Contacto *</Label>
            <Input id="contact_phone" {...register('contact_phone')} disabled={isPending} />
            {errors.contact_phone && (
              <p className="text-sm text-destructive">{errors.contact_phone.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Estado *</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register('status')}
                disabled={isPending}
              >
                <option value="ACTIVE">Activa</option>
                <option value="INACTIVE">Inactiva</option>
              </select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="is_main"
                  {...register('is_main')}
                  disabled={isPending}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="is_main" className="cursor-pointer">
                  Sucursal principal
                </Label>
              </div>
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

