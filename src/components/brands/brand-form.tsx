'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateBrand, useUpdateBrand, useBrand } from '@/lib/hooks/use-brands';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

const brandSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
});

type BrandFormData = z.infer<typeof brandSchema>;

interface BrandFormProps {
  brandId?: string;
}

export function BrandForm({ brandId }: BrandFormProps) {
  const router = useRouter();
  const isEditing = !!brandId;
  const { data: brand, isLoading: isLoadingBrand } = useBrand(brandId || '');
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
  });

  useEffect(() => {
    if (brand && isEditing) {
      setValue('name', brand.name);
      setValue('description', brand.description || '');
      setValue('logo_url', brand.logo_url || '');
    }
  }, [brand, isEditing, setValue]);

  const onSubmit = async (data: BrandFormData) => {
    try {
      const submitData = {
        ...data,
        logo_url: data.logo_url || undefined,
      };

      if (isEditing && brandId) {
        await updateBrand.mutateAsync({
          id: brandId,
          data: submitData,
        });
      } else {
        await createBrand.mutateAsync(submitData);
      }
      router.push('/brands');
    } catch (error) {
      console.error('Error saving brand:', error);
    }
  };

  if (isLoadingBrand && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando marca...</p>
        </div>
      </div>
    );
  }

  const isPending = createBrand.isPending || updateBrand.isPending;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Marca' : 'Nueva Marca'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Actualiza la información de la marca'
            : 'Crea una nueva marca de productos'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" {...register('name')} disabled={isPending} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              {...register('description')}
              disabled={isPending}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_url">URL del Logo</Label>
            <Input
              id="logo_url"
              type="url"
              {...register('logo_url')}
              disabled={isPending}
              placeholder="https://example.com/logo.png"
            />
            {errors.logo_url && (
              <p className="text-sm text-destructive">{errors.logo_url.message}</p>
            )}
            {brand?.logo_url && (
              <div className="mt-2">
                <img
                  src={brand.logo_url}
                  alt={brand.name}
                  className="h-20 w-20 object-contain border rounded"
                />
              </div>
            )}
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

