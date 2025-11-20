'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateUser, useUpdateUser, useUser } from '@/lib/hooks/use-users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/lib/constants/roles';

const userSchema = z.object({
  email: z.string().email('Email inválido'),
  first_name: z.string().min(1, 'El nombre es requerido'),
  last_name: z.string().min(1, 'El apellido es requerido'),
  phone: z.string().optional(),
  role: z.enum(['OWNER', 'SUPERVISOR', 'MERCHANT_USER', 'CUSTOMER']),
  active: z.boolean().default(true),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  userId?: string;
}

export function UserForm({ userId }: UserFormProps) {
  const router = useRouter();
  const isEditing = !!userId;
  const { data: user, isLoading: isLoadingUser } = useUser(userId || '');
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      active: true,
      role: 'MERCHANT_USER',
    },
  });

  // Cargar datos del usuario si está editando
  useEffect(() => {
    if (user && isEditing) {
      setValue('email', user.email);
      setValue('first_name', user.first_name);
      setValue('last_name', user.last_name);
      setValue('phone', user.phone || '');
      setValue('role', user.role);
      setValue('active', user.active);
    }
  }, [user, isEditing, setValue]);

  const onSubmit = async (data: UserFormData) => {
    try {
      if (isEditing && userId) {
        await updateUser.mutateAsync({
          id: userId,
          data,
        });
      } else {
        await createUser.mutateAsync(data);
      }
      router.push('/users');
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  if (isLoadingUser && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando usuario...</p>
        </div>
      </div>
    );
  }

  const isPending = createUser.isPending || updateUser.isPending;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Actualiza la información del usuario'
            : 'Crea un nuevo usuario en el sistema'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre *</Label>
              <Input
                id="first_name"
                {...register('first_name')}
                disabled={isPending}
              />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido *</Label>
              <Input
                id="last_name"
                {...register('last_name')}
                disabled={isPending}
              />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              disabled={isPending || isEditing}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
            {isEditing && (
              <p className="text-xs text-muted-foreground">
                El email no se puede modificar
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono (opcional)</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              disabled={isPending}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol *</Label>
            <select
              id="role"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...register('role')}
              disabled={isPending}
            >
              <option value="MERCHANT_USER">Usuario</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="OWNER">Propietario</option>
              <option value="CUSTOMER">Cliente</option>
            </select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="active"
              {...register('active')}
              disabled={isPending}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="active" className="cursor-pointer">
              Usuario activo
            </Label>
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

