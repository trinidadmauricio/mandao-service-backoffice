'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateUser, useUpdateUser, useUser } from '@/lib/hooks/use-users';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

const userSchema = z
  .object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').optional(),
    first_name: z.string().min(1, 'El nombre es requerido'),
    last_name: z.string().min(1, 'El apellido es requerido'),
    phone: z.string().optional(),
    role: z.enum(['SAAS_ADMIN', 'SAAS_EDITOR', 'OWNER', 'SUPERVISOR', 'MERCHANT_USER', 'LOGISTICS_PROVIDER', 'DRIVER']),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
  })
  .refine(() => {
    // Password es requerido solo al crear (no al editar)
    // Esta validación se manejará en el componente
    return true;
  });

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  userId?: string;
}

export function UserForm({ userId }: UserFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const isEditing = !!userId;
  const { data: user, isLoading: isLoadingUser } = useUser(userId || '');
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  
  // Determinar qué roles se pueden crear según el rol del usuario actual
  const canCreateSupervisor = currentUser?.role === 'LOGISTICS_PROVIDER';

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      status: 'ACTIVE',
      role: 'MERCHANT_USER',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
    },
  });

  // Cargar datos del usuario si está editando
  useEffect(() => {
    if (user && isEditing) {
      form.reset({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone || '',
        role: user.role,
        status: (user.status as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') || 'ACTIVE',
        password: '', // No cargar password al editar
      });
    }
  }, [user, isEditing, form]);

  const onSubmit = async (data: UserFormData) => {
    try {
      // Validar password al crear
      if (!isEditing && !data.password) {
        toast({
          title: 'Error de validación',
          description: 'La contraseña es requerida para crear un nuevo usuario.',
          variant: 'destructive',
        });
        return;
      }

      const submitData = {
        ...data,
        // Solo incluir password si está presente (para crear o actualizar)
        password: data.password || undefined,
        // No enviar password vacío al actualizar si no se proporciona
        ...(isEditing && !data.password && { password: undefined }),
        // Si se está creando un SUPERVISOR y el usuario actual es LOGISTICS_PROVIDER,
        // asignar automáticamente su logistics_provider_id
        ...(data.role === 'SUPERVISOR' && 
            !isEditing && 
            currentUser?.role === 'LOGISTICS_PROVIDER' && 
            currentUser?.logistics_provider_id && {
              logistics_provider_id: currentUser.logistics_provider_id,
            }),
      };

      if (isEditing && userId) {
        await updateUser.mutateAsync({
          id: userId,
          data: submitData,
        });
        toast({
          title: 'Usuario actualizado',
          description: 'El usuario ha sido actualizado exitosamente.',
        });
      } else {
        await createUser.mutateAsync(submitData);
        toast({
          title: 'Usuario creado',
          description: 'El usuario ha sido creado exitosamente.',
        });
      }
      router.push('/users');
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Hubo un error al guardar el usuario.',
        variant: 'destructive',
      });
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input disabled={isPending} autoFocus={!isEditing} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido *</FormLabel>
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" disabled={isPending || isEditing} {...field} />
                  </FormControl>
                  {isEditing && (
                    <FormDescription>El email no se puede modificar</FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditing && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña *</FormLabel>
                    <FormControl>
                      <Input type="password" disabled={isPending} {...field} />
                    </FormControl>
                    <FormDescription>Mínimo 8 caracteres</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isEditing && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva Contraseña (opcional)</FormLabel>
                    <FormControl>
                      <Input type="password" disabled={isPending} {...field} />
                    </FormControl>
                    <FormDescription>
                      Deja en blanco si no deseas cambiar la contraseña
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono (opcional)</FormLabel>
                  <FormControl>
                    <Input type="tel" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {allowedRoles.includes('MERCHANT_USER') && (
                          <SelectItem value="MERCHANT_USER">Usuario</SelectItem>
                        )}
                        {allowedRoles.includes('SUPERVISOR') && (
                          <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                        )}
                        {allowedRoles.includes('OWNER') && (
                          <SelectItem value="OWNER">Propietario</SelectItem>
                        )}
                        {/* CUSTOMER no debe aparecer - solo se crea desde storefront */}
                        {allowedRoles.includes('LOGISTICS_PROVIDER') && (
                          <SelectItem value="LOGISTICS_PROVIDER">Proveedor Logístico</SelectItem>
                        )}
                        {allowedRoles.includes('DRIVER') && (
                          <SelectItem value="DRIVER">Conductor</SelectItem>
                        )}
                        {allowedRoles.includes('SAAS_ADMIN') && (
                          <SelectItem value="SAAS_ADMIN">Admin SaaS</SelectItem>
                        )}
                        {allowedRoles.includes('SAAS_EDITOR') && (
                          <SelectItem value="SAAS_EDITOR">Editor SaaS</SelectItem>
                        )}
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
                    <FormLabel>Estado *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Activo</SelectItem>
                        <SelectItem value="INACTIVE">Inactivo</SelectItem>
                        <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
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

