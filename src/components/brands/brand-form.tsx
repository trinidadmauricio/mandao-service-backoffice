'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateBrand, useUpdateBrand, useBrand } from '@/lib/hooks/use-brands';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { generateSlug } from '@/lib/utils/slug';

const brandSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido'),
  description: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  is_active: z.boolean().optional(),
});

type BrandFormData = z.infer<typeof brandSchema>;

interface BrandFormProps {
  brandId?: string;
}

export function BrandForm({ brandId }: BrandFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!brandId;
  const { data: brand, isLoading: isLoadingBrand } = useBrand(brandId || '');
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      logo_url: '',
      is_active: true,
    },
  });

  // Generar slug automáticamente desde el nombre
  const nameValue = form.watch('name');
  useEffect(() => {
    if (!isEditing && nameValue) {
      const autoSlug = generateSlug(nameValue);
      form.setValue('slug', autoSlug, { shouldValidate: false });
    }
  }, [nameValue, isEditing, form]);

  useEffect(() => {
    if (brand && isEditing) {
      form.reset({
        name: brand.name,
        slug: brand.slug || '',
        description: brand.description || '',
        logo_url: brand.logo_url || '',
        is_active: brand.is_active ?? true,
      });
    }
  }, [brand, isEditing, form]);

  const onSubmit = async (data: BrandFormData) => {
    try {
      const submitData = {
        ...data,
        logo_url: data.logo_url || undefined,
        is_active: data.is_active ?? true,
      };

      if (isEditing && brandId) {
        await updateBrand.mutateAsync({
          id: brandId,
          data: submitData,
        });
        toast({
          title: 'Marca actualizada',
          description: 'La marca ha sido actualizada exitosamente.',
        });
      } else {
        await createBrand.mutateAsync(submitData);
        toast({
          title: 'Marca creada',
          description: 'La marca ha sido creada exitosamente.',
        });
      }
      router.push('/brands');
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Hubo un error al guardar la marca.',
        variant: 'destructive',
      });
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug *</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      {...field}
                      placeholder="nike"
                      onChange={(e) => {
                        const slug = generateSlug(e.target.value);
                        field.onChange(slug);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    URL amigable (se genera automáticamente desde el nombre)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL del Logo</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/logo.png"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  {field.value && (
                    <div className="mt-2">
                      <div className="relative h-20 w-20 border rounded overflow-hidden">
                        <Image
                          src={field.value}
                          alt={form.watch('name') || 'Logo'}
                          fill
                          className="object-contain"
                          onError={(e) => {
                            // Si la imagen falla, ocultar el componente Image
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {!field.value && form.watch('name') && (
                    <div className="mt-2">
                      <div
                        className="h-20 w-20 border rounded flex items-center justify-center text-white font-semibold text-lg"
                        style={{
                          backgroundColor: `hsl(${(form.watch('name') || '').charCodeAt(0) * 137.508 % 360}, 70%, 50%)`,
                        }}
                      >
                        {form.watch('name')?.charAt(0).toUpperCase() || '?'}
                      </div>
                    </div>
                  )}
                  <FormMessage />
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

