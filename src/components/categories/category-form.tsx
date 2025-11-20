'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateCategory, useUpdateCategory, useCategory } from '@/lib/hooks/use-categories';
import { useCategories } from '@/lib/hooks/use-categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  parent_id: z.string().uuid().optional().or(z.literal('')),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  categoryId?: string;
}

export function CategoryForm({ categoryId }: CategoryFormProps) {
  const router = useRouter();
  const isEditing = !!categoryId;
  const { data: category, isLoading: isLoadingCategory } = useCategory(categoryId || '');
  const { data: categories } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  useEffect(() => {
    if (category && isEditing) {
      setValue('name', category.name);
      setValue('description', category.description || '');
      setValue('parent_id', category.parent_id || '');
    }
  }, [category, isEditing, setValue]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const submitData = {
        ...data,
        parent_id: data.parent_id || undefined,
      };

      if (isEditing && categoryId) {
        await updateCategory.mutateAsync({
          id: categoryId,
          data: submitData,
        });
      } else {
        await createCategory.mutateAsync(submitData);
      }
      router.push('/categories');
    } catch (error) {
      console.error('Error saving category:', error);
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
            <Label htmlFor="parent_id">Categoría Padre (opcional)</Label>
            <select
              id="parent_id"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...register('parent_id')}
              disabled={isPending}
            >
              <option value="">Sin categoría padre</option>
              {availableParents.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
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

