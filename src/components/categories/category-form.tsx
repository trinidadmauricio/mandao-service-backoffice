'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateCategory, useUpdateCategory, useCategory } from '@/lib/hooks/use-categories';
import { useCategories } from '@/lib/hooks/use-categories';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { generateSlug } from '@/lib/utils/slug';

const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido'),
  description: z.string().optional(),
  parent_id: z.string().uuid().optional().or(z.literal('')),
  image_url: z.string().url().optional().or(z.literal('')),
  display_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  categoryId?: string;
}

export function CategoryForm({ categoryId }: CategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!categoryId;
  const { data: category, isLoading: isLoadingCategory } = useCategory(categoryId || '');
  const { data: categories } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      parent_id: '',
      image_url: '',
      display_order: 0,
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
    if (category && isEditing) {
      form.reset({
        name: category.name,
        slug: category.slug || '',
        description: category.description || '',
        parent_id: category.parent_id || '',
        image_url: category.image_url || '',
        display_order: category.display_order || 0,
        is_active: category.is_active ?? true,
      });
    }
  }, [category, isEditing, form]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const submitData = {
        ...data,
        parent_id: data.parent_id || undefined,
        image_url: data.image_url || undefined,
        display_order: data.display_order || undefined,
        is_active: data.is_active ?? true,
      };

      if (isEditing && categoryId) {
        await updateCategory.mutateAsync({
          id: categoryId,
          data: submitData,
        });
        toast({
          title: 'Categoría actualizada',
          description: 'La categoría ha sido actualizada exitosamente.',
        });
      } else {
        await createCategory.mutateAsync(submitData);
        toast({
          title: 'Categoría creada',
          description: 'La categoría ha sido creada exitosamente.',
        });
      }
      router.push('/categories');
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Hubo un error al guardar la categoría.',
        variant: 'destructive',
      });
    }
  };

  if (isLoadingCategory && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando categoría...</p>
        </div>
      </div>
    );
  }

  const isPending = createCategory.isPending || updateCategory.isPending;
  const availableParents = categories?.filter((c) => c.id !== categoryId) || [];

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Categoría' : 'Nueva Categoría'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Actualiza la información de la categoría'
            : 'Crea una nueva categoría de productos'}
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
                      placeholder="electronica"
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
              name="parent_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría Padre (opcional)</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value || undefined)}
                    value={field.value || undefined}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sin categoría padre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableParents.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

