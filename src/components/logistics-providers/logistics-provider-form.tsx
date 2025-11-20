'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useCreateLogisticsProvider,
  useUpdateLogisticsProvider,
  type LogisticsProvider,
} from '@/lib/hooks/use-logistics-providers';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const logisticsProviderSchema = z.object({
  company_name: z.string().min(1, 'El nombre de la empresa es requerido').max(255),
  tax_id: z.string().min(1, 'El RUC/NIT es requerido').max(50),
  representative_name: z.string().min(1, 'El nombre del representante es requerido').max(255),
  representative_phone: z.string().min(1, 'El teléfono es requerido').max(50),
  representative_document: z.string().min(1, 'El documento del representante es requerido').max(50),
  verification_status: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'INACTIVE']).optional(),
});

type LogisticsProviderFormData = z.infer<typeof logisticsProviderSchema>;

interface LogisticsProviderFormProps {
  initialData?: LogisticsProvider;
  onSuccess?: () => void;
}

export function LogisticsProviderForm({ initialData, onSuccess }: LogisticsProviderFormProps) {
  const createProvider = useCreateLogisticsProvider();
  const updateProvider = useUpdateLogisticsProvider();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LogisticsProviderFormData>({
    resolver: zodResolver(logisticsProviderSchema),
    defaultValues: initialData
      ? {
          company_name: initialData.company_name,
          tax_id: initialData.tax_id,
          representative_name: initialData.representative_name,
          representative_phone: initialData.representative_phone,
          representative_document: initialData.representative_document,
          verification_status: initialData.verification_status,
          status: initialData.status,
        }
      : {
          verification_status: 'PENDING',
          status: 'ACTIVE',
        },
  });

  const isEditing = !!initialData;

  const onSubmit = async (data: LogisticsProviderFormData) => {
    try {
      if (isEditing) {
        await updateProvider.mutateAsync({
          id: initialData.id,
          data: {
            company_name: data.company_name,
            tax_id: data.tax_id,
            representative_name: data.representative_name,
            representative_phone: data.representative_phone,
            representative_document: data.representative_document,
            verification_status: data.verification_status,
            status: data.status,
          },
        });
        toast({
          title: 'Proveedor actualizado',
          description: 'El proveedor logístico ha sido actualizado exitosamente.',
        });
      } else {
        await createProvider.mutateAsync({
          company_name: data.company_name,
          tax_id: data.tax_id,
          representative_name: data.representative_name,
          representative_phone: data.representative_phone,
          representative_document: data.representative_document,
          verification_status: data.verification_status,
          status: data.status,
        });
        toast({
          title: 'Proveedor creado',
          description: 'El proveedor logístico ha sido creado exitosamente.',
        });
      }
      onSuccess?.();
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Hubo un error al guardar el proveedor.',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company_name">Nombre de la Empresa *</Label>
          <Input
            id="company_name"
            {...register('company_name')}
            disabled={createProvider.isPending || updateProvider.isPending}
          />
          {errors.company_name && (
            <p className="text-sm text-destructive">{errors.company_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax_id">RUC/NIT *</Label>
          <Input
            id="tax_id"
            {...register('tax_id')}
            disabled={createProvider.isPending || updateProvider.isPending}
          />
          {errors.tax_id && (
            <p className="text-sm text-destructive">{errors.tax_id.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="representative_name">Nombre del Representante Legal *</Label>
          <Input
            id="representative_name"
            {...register('representative_name')}
            disabled={createProvider.isPending || updateProvider.isPending}
          />
          {errors.representative_name && (
            <p className="text-sm text-destructive">{errors.representative_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="representative_phone">Teléfono del Representante *</Label>
          <Input
            id="representative_phone"
            {...register('representative_phone')}
            disabled={createProvider.isPending || updateProvider.isPending}
          />
          {errors.representative_phone && (
            <p className="text-sm text-destructive">{errors.representative_phone.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="representative_document">Documento del Representante *</Label>
        <Input
          id="representative_document"
          {...register('representative_document')}
          disabled={createProvider.isPending || updateProvider.isPending}
        />
        {errors.representative_document && (
          <p className="text-sm text-destructive">{errors.representative_document.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="verification_status">Estado de Verificación</Label>
          <select
            id="verification_status"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...register('verification_status')}
            disabled={createProvider.isPending || updateProvider.isPending}
          >
            <option value="PENDING">Pendiente</option>
            <option value="VERIFIED">Verificado</option>
            <option value="REJECTED">Rechazado</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <select
            id="status"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...register('status')}
            disabled={createProvider.isPending || updateProvider.isPending}
          >
            <option value="ACTIVE">Activo</option>
            <option value="SUSPENDED">Suspendido</option>
            <option value="INACTIVE">Inactivo</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="submit"
          disabled={createProvider.isPending || updateProvider.isPending}
        >
          {createProvider.isPending || updateProvider.isPending
            ? 'Guardando...'
            : isEditing
            ? 'Actualizar Proveedor'
            : 'Crear Proveedor'}
        </Button>
      </div>
    </form>
  );
}

