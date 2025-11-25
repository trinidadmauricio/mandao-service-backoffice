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

  const form = useForm<LogisticsProviderFormData>({
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
          company_name: '',
          tax_id: '',
          representative_name: '',
          representative_phone: '',
          representative_document: '',
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

  const isPending = createProvider.isPending || updateProvider.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la Empresa *</FormLabel>
                <FormControl>
                  <Input disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tax_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RUC/NIT *</FormLabel>
                <FormControl>
                  <Input disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="representative_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Representante Legal *</FormLabel>
                <FormControl>
                  <Input disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="representative_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono del Representante *</FormLabel>
                <FormControl>
                  <Input disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="representative_document"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Documento del Representante *</FormLabel>
              <FormControl>
                <Input disabled={isPending} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="verification_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado de Verificación</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || 'PENDING'}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="VERIFIED">Verificado</SelectItem>
                    <SelectItem value="REJECTED">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || 'ACTIVE'}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Activo</SelectItem>
                    <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isPending}>
            {isPending
              ? 'Guardando...'
              : isEditing
              ? 'Actualizar Proveedor'
              : 'Crear Proveedor'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

