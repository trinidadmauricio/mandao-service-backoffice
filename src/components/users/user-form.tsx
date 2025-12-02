"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateUser, useUpdateUser, useUser } from "@/lib/hooks/use-users";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCw, Copy, Check, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { USER_ROLE } from "@/lib/constants/roles";

const userSchema = z
  .object({
    email: z.string().email("Email inválido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .optional(),
    first_name: z.string().min(1, "El nombre es requerido"),
    last_name: z.string().min(1, "El apellido es requerido"),
    phone: z.string().optional(),
    role: z.enum([
      USER_ROLE.SAAS_ADMIN,
      USER_ROLE.SAAS_EDITOR,
      USER_ROLE.OWNER,
      USER_ROLE.SUPERVISOR,
      USER_ROLE.MERCHANT_USER,
      USER_ROLE.LOGISTICS_PROVIDER,
      USER_ROLE.DRIVER,
    ]),
    status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).default("ACTIVE"),
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

/**
 * Genera una contraseña segura aleatoria
 * @param length Longitud de la contraseña (por defecto 12)
 * @returns Contraseña generada
 */
function generateSecurePassword(length: number = 12): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const allChars = lowercase + uppercase + numbers + symbols;

  // Asegurar que tenga al menos un carácter de cada tipo
  let password = "";
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Completar el resto de la longitud
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Mezclar los caracteres
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

export function UserForm({ userId }: UserFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const isEditing = !!userId;
  const { data: user, isLoading: isLoadingUser } = useUser(userId || "");
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      status: "ACTIVE",
      role: USER_ROLE.MERCHANT_USER,
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      phone: "",
    },
  });

  // Cargar datos del usuario si está editando
  useEffect(() => {
    if (user && isEditing) {
      // Filtrar CUSTOMER ya que no se puede editar desde el backoffice
      const validRole =
        user.role === USER_ROLE.CUSTOMER ? USER_ROLE.MERCHANT_USER : user.role;
      // Asegurar que el rol sea uno de los permitidos en el schema
      const allowedRoles = [
        USER_ROLE.SAAS_ADMIN,
        USER_ROLE.SAAS_EDITOR,
        USER_ROLE.OWNER,
        USER_ROLE.SUPERVISOR,
        USER_ROLE.MERCHANT_USER,
        USER_ROLE.LOGISTICS_PROVIDER,
        USER_ROLE.DRIVER,
      ] as const;
      const roleForForm = allowedRoles.includes(
        validRole as (typeof allowedRoles)[number]
      )
        ? (validRole as (typeof allowedRoles)[number])
        : USER_ROLE.MERCHANT_USER;

      // Usar reset para establecer todos los valores de una vez
      // Esto asegura que el formulario se actualice correctamente
      // shouldValidate: false para no validar al cargar
      form.reset(
        {
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone || "",
          role: roleForForm,
          status:
            (user.status as "ACTIVE" | "INACTIVE" | "SUSPENDED") || "ACTIVE",
          password: "",
        },
        {
          keepDefaultValues: false,
        }
      );
    }
  }, [user, isEditing, form]);

  const onSubmit = async (data: UserFormData) => {
    try {
      // Validar password al crear
      if (!isEditing && !data.password) {
        toast({
          title: "Error de validación",
          description:
            "La contraseña es requerida para crear un nuevo usuario.",
          variant: "destructive",
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
        ...(data.role === USER_ROLE.SUPERVISOR &&
          !isEditing &&
          currentUser?.role === USER_ROLE.LOGISTICS_PROVIDER &&
          currentUser?.logistics_provider_id && {
            logistics_provider_id: currentUser.logistics_provider_id,
          }),
        // Si se está creando un DRIVER y el usuario actual es LOGISTICS_PROVIDER o SUPERVISOR,
        // asignar automáticamente su logistics_provider_id
        ...(data.role === USER_ROLE.DRIVER &&
          !isEditing &&
          (currentUser?.role === USER_ROLE.LOGISTICS_PROVIDER ||
            currentUser?.role === USER_ROLE.SUPERVISOR) &&
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
          title: "Usuario actualizado",
          description: "El usuario ha sido actualizado exitosamente.",
        });
      } else {
        await createUser.mutateAsync(submitData);
        toast({
          title: "Usuario creado",
          description: "El usuario ha sido creado exitosamente.",
        });
      }
      router.push("/users");
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Hubo un error al guardar el usuario.",
        variant: "destructive",
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
        <CardTitle>{isEditing ? "Editar Usuario" : "Nuevo Usuario"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Actualiza la información del usuario"
            : "Crea un nuevo usuario en el sistema"}
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
                      <Input
                        disabled={isPending}
                        autoFocus={!isEditing}
                        {...field}
                      />
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
                    <Input
                      type="email"
                      disabled={isPending || isEditing}
                      {...field}
                    />
                  </FormControl>
                  {isEditing && (
                    <FormDescription>
                      El email no se puede modificar
                    </FormDescription>
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
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          disabled={isPending}
                          className="pr-24"
                          {...field}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isPending}
                            title={
                              showPassword
                                ? "Ocultar contraseña"
                                : "Mostrar contraseña"
                            }
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => {
                              const newPassword = generateSecurePassword(12);
                              field.onChange(newPassword);
                              toast({
                                title: "Contraseña generada",
                                description:
                                  "Se ha generado una contraseña segura. Haz clic en el icono de copiar para copiarla.",
                              });
                            }}
                            disabled={isPending}
                            title="Generar contraseña segura"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          {field.value && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(
                                    field.value || ""
                                  );
                                  setCopied(true);
                                  toast({
                                    title: "Contraseña copiada",
                                    description:
                                      "La contraseña se ha copiado al portapapeles.",
                                  });
                                  setTimeout(() => setCopied(false), 2000);
                                } catch {
                                  toast({
                                    title: "Error",
                                    description:
                                      "No se pudo copiar la contraseña.",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              disabled={isPending}
                              title="Copiar contraseña"
                            >
                              {copied ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Mínimo 8 caracteres. Usa el botón de generar para crear
                      una contraseña segura.
                    </FormDescription>
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
                      <div className="relative">
                        <Input
                          type={showEditPassword ? "text" : "password"}
                          disabled={isPending}
                          className="pr-24"
                          {...field}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() =>
                              setShowEditPassword(!showEditPassword)
                            }
                            disabled={isPending}
                            title={
                              showEditPassword
                                ? "Ocultar contraseña"
                                : "Mostrar contraseña"
                            }
                          >
                            {showEditPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => {
                              const newPassword = generateSecurePassword(12);
                              field.onChange(newPassword);
                              toast({
                                title: "Contraseña generada",
                                description:
                                  "Se ha generado una contraseña segura. Haz clic en el icono de copiar para copiarla.",
                              });
                            }}
                            disabled={isPending}
                            title="Generar contraseña segura"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          {field.value && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(
                                    field.value || ""
                                  );
                                  setCopied(true);
                                  toast({
                                    title: "Contraseña copiada",
                                    description:
                                      "La contraseña se ha copiado al portapapeles.",
                                  });
                                  setTimeout(() => setCopied(false), 2000);
                                } catch {
                                  toast({
                                    title: "Error",
                                    description:
                                      "No se pudo copiar la contraseña.",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              disabled={isPending}
                              title="Copiar contraseña"
                            >
                              {copied ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Deja en blanco si no deseas cambiar la contraseña. Usa el
                      botón de generar para crear una contraseña segura.
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
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                      disabled={isPending || isEditing}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                      </FormControl>
                      {isEditing && (
                        <FormDescription>
                          El rol no se puede modificar al editar un usuario
                        </FormDescription>
                      )}
                      <SelectContent>
                        {/* Determinar qué roles están permitidos según el usuario actual */}
                        {(() => {
                          const allowedRolesForCurrentUser: string[] = [];

                          if (
                            currentUser?.role === USER_ROLE.SAAS_ADMIN ||
                            currentUser?.role === USER_ROLE.SAAS_EDITOR
                          ) {
                            allowedRolesForCurrentUser.push(
                              USER_ROLE.SAAS_ADMIN,
                              USER_ROLE.SAAS_EDITOR,
                              USER_ROLE.OWNER,
                              USER_ROLE.MERCHANT_USER,
                              USER_ROLE.LOGISTICS_PROVIDER,
                              USER_ROLE.DRIVER
                            );
                          } else if (currentUser?.role === USER_ROLE.OWNER) {
                            allowedRolesForCurrentUser.push(
                              USER_ROLE.MERCHANT_USER
                            );
                          } else if (
                            currentUser?.role === USER_ROLE.LOGISTICS_PROVIDER
                          ) {
                            allowedRolesForCurrentUser.push(
                              USER_ROLE.SUPERVISOR,
                              USER_ROLE.DRIVER
                            );
                          } else if (
                            currentUser?.role === USER_ROLE.SUPERVISOR
                          ) {
                            allowedRolesForCurrentUser.push(USER_ROLE.DRIVER);
                          }

                          // Obtener el valor actual del formulario para asegurar que el SelectItem esté presente
                          const currentFormRole = field.value;

                          return (
                            <>
                              {/* Al editar, SIEMPRE mostrar el rol del usuario editado primero para que SelectValue lo encuentre */}
                              {/* Usar el valor actual del formulario para asegurar coincidencia exacta */}
                              {/* Esto es crítico: el SelectItem debe estar presente cuando el SelectValue se renderiza */}
                              {isEditing && currentFormRole && (
                                <SelectItem key={`current-role-${currentFormRole}`} value={currentFormRole}>
                                  {currentFormRole === USER_ROLE.SAAS_ADMIN &&
                                    "Administrador SAAS"}
                                  {currentFormRole === USER_ROLE.SAAS_EDITOR &&
                                    "Editor SAAS"}
                                  {currentFormRole === USER_ROLE.OWNER &&
                                    "Propietario"}
                                  {currentFormRole === USER_ROLE.MERCHANT_USER &&
                                    "Usuario del Comercio"}
                                  {currentFormRole === USER_ROLE.LOGISTICS_PROVIDER &&
                                    "Proveedor Logístico"}
                                  {currentFormRole === USER_ROLE.SUPERVISOR &&
                                    "Supervisor"}
                                  {currentFormRole === USER_ROLE.DRIVER && "Conductor"}
                                </SelectItem>
                              )}

                              {/* Roles visibles para SAAS_ADMIN y SAAS_EDITOR */}
                              {(currentUser?.role === USER_ROLE.SAAS_ADMIN ||
                                currentUser?.role ===
                                  USER_ROLE.SAAS_EDITOR) && (
                                <>
                                  {(!isEditing ||
                                    currentFormRole !== USER_ROLE.SAAS_ADMIN) && (
                                    <SelectItem value={USER_ROLE.SAAS_ADMIN}>
                                      Administrador SAAS
                                    </SelectItem>
                                  )}
                                  {(!isEditing ||
                                    currentFormRole !== USER_ROLE.SAAS_EDITOR) && (
                                    <SelectItem value={USER_ROLE.SAAS_EDITOR}>
                                      Editor SAAS
                                    </SelectItem>
                                  )}
                                  {(!isEditing ||
                                    currentFormRole !== USER_ROLE.OWNER) && (
                                    <SelectItem value={USER_ROLE.OWNER}>
                                      Propietario
                                    </SelectItem>
                                  )}
                                  {(!isEditing ||
                                    currentFormRole !== USER_ROLE.MERCHANT_USER) && (
                                    <SelectItem value={USER_ROLE.MERCHANT_USER}>
                                      Usuario del Comercio
                                    </SelectItem>
                                  )}
                                  {(!isEditing ||
                                    currentFormRole !==
                                      USER_ROLE.LOGISTICS_PROVIDER) && (
                                    <SelectItem
                                      value={USER_ROLE.LOGISTICS_PROVIDER}
                                    >
                                      Proveedor Logístico
                                    </SelectItem>
                                  )}
                                  {(!isEditing ||
                                    currentFormRole !== USER_ROLE.DRIVER) && (
                                    <SelectItem value={USER_ROLE.DRIVER}>
                                      Conductor
                                    </SelectItem>
                                  )}
                                </>
                              )}

                              {/* Roles visibles para OWNER */}
                              {currentUser?.role === USER_ROLE.OWNER && (
                                <>
                                  {(!isEditing ||
                                    currentFormRole !== USER_ROLE.MERCHANT_USER) && (
                                    <SelectItem value={USER_ROLE.MERCHANT_USER}>
                                      Usuario del Comercio
                                    </SelectItem>
                                  )}
                                </>
                              )}

                              {/* Roles visibles para LOGISTICS_PROVIDER */}
                              {currentUser?.role ===
                                USER_ROLE.LOGISTICS_PROVIDER && (
                                <>
                                  {(!isEditing ||
                                    currentFormRole !== USER_ROLE.SUPERVISOR) && (
                                    <SelectItem value={USER_ROLE.SUPERVISOR}>
                                      Supervisor
                                    </SelectItem>
                                  )}
                                  {(!isEditing ||
                                    currentFormRole !== USER_ROLE.DRIVER) && (
                                    <SelectItem value={USER_ROLE.DRIVER}>
                                      Conductor
                                    </SelectItem>
                                  )}
                                </>
                              )}

                              {/* Roles visibles para SUPERVISOR */}
                              {currentUser?.role === USER_ROLE.SUPERVISOR && (
                                <>
                                  {(!isEditing ||
                                    currentFormRole !== USER_ROLE.DRIVER) && (
                                    <SelectItem value={USER_ROLE.DRIVER}>
                                      Conductor
                                    </SelectItem>
                                  )}
                                </>
                              )}
                            </>
                          );
                        })()}

                        {/* Otros roles no pueden crear usuarios */}
                        {/* CUSTOMER nunca se puede crear desde el backoffice */}
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
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
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
                {isPending
                  ? "Guardando..."
                  : isEditing
                  ? "Actualizar"
                  : "Crear"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
