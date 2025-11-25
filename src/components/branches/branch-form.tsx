'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateBranch, useUpdateBranch, useBranch } from '@/lib/hooks/use-branches';
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

  const form = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      is_main: false,
      status: 'ACTIVE',
      name: '',
      address: '',
      gps_lat: 0,
      gps_lng: 0,
      contact_phone: '',
      operating_hours: {},
    },
  });

  useEffect(() => {
    if (branch && isEditing) {
      form.reset({
        name: branch.name,
        address: branch.address,
        gps_lat: branch.gps_lat,
        gps_lng: branch.gps_lng,
        contact_phone: branch.contact_phone,
        is_main: branch.is_main,
        status: branch.status,
        operating_hours: branch.operating_hours || {},
      });
    }
  }, [branch, isEditing, form]);

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección *</FormLabel>
                  <FormControl>
                    <Textarea disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gps_lat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitud GPS *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
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
                name="gps_lng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitud GPS *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
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

            <FormField
              control={form.control}
              name="contact_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono de Contacto *</FormLabel>
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
                        <SelectItem value="ACTIVE">Activa</SelectItem>
                        <SelectItem value="INACTIVE">Inactiva</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_main"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-8">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Sucursal principal</FormLabel>
                    </div>
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

