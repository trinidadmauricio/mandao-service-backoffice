"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateDriver,
  useUpdateDriver,
  useDriver,
} from "@/lib/hooks/use-drivers";
import { useLogisticsProviders } from "@/lib/hooks/use-logistics-providers";
import { useUsers } from "@/lib/hooks/use-users";
import { useVehicles } from "@/lib/hooks/use-vehicles";
import { useAuth } from "@/lib/hooks/use-auth";
import { USER_ROLE } from "@/lib/constants/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

const driverSchema = z
  .object({
    logistics_provider_id: z
      .string()
      .uuid("El proveedor logístico es requerido"),
    user_id: z.string().uuid("El usuario es requerido"),
    identity_document: z
      .string()
      .min(1, "El documento de identidad es requerido"),
    driving_license: z.string().min(1, "La licencia de conducir es requerida"),
    date_of_birth: z.string().min(1, "La fecha de nacimiento es requerida"),
    emergency_contact: z.object({
      name: z
        .string()
        .min(1, "El nombre del contacto de emergencia es requerido"),
      phone: z
        .string()
        .min(1, "El teléfono del contacto de emergencia es requerido"),
      relationship: z.string().optional(),
    }),
    has_own_vehicle: z.boolean().default(false),
    vehicle_id: z.string().uuid().optional().or(z.literal("")),
    work_type: z.enum(["FULL_TIME", "PART_TIME", "FREELANCE"]),
    work_zone: z.string().optional(),
    availability_status: z
      .enum(["AVAILABLE", "BUSY", "OFFLINE", "SUSPENDED"])
      .default("AVAILABLE"),
    documents: z.record(z.unknown()).optional(),
  })
  .refine((data) => !data.has_own_vehicle || !!data.vehicle_id, {
    message: "Debe seleccionar un vehículo si tiene vehículo propio",
    path: ["vehicle_id"],
  });

type DriverFormData = z.infer<typeof driverSchema>;

interface DriverFormProps {
  driverId?: string;
}

export function DriverForm({ driverId }: DriverFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const isEditing = !!driverId;
  const { data: driver, isLoading: isLoadingDriver } = useDriver(
    driverId || ""
  );
  const { data: logisticsProviders } = useLogisticsProviders();
  const { data: users } = useUsers({ role: "DRIVER" });
  const { data: vehicles } = useVehicles();
  const createDriver = useCreateDriver();
  const updateDriver = useUpdateDriver();

  // Determinar si el campo "Proveedor Logístico" debe estar oculto
  // LOGISTICS_PROVIDER y SUPERVISOR no deben ver este campo, ya que pertenecen a un proveedor específico
  const shouldHideLogisticsProviderField =
    currentUser &&
    (currentUser.role === USER_ROLE.LOGISTICS_PROVIDER ||
      currentUser.role === USER_ROLE.SUPERVISOR);

  const form = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      has_own_vehicle: false,
      availability_status: "AVAILABLE",
      work_type: "FULL_TIME",
      // Si el usuario es LOGISTICS_PROVIDER o SUPERVISOR, usar su logistics_provider_id automáticamente
      logistics_provider_id:
        shouldHideLogisticsProviderField && currentUser?.logistics_provider_id
          ? currentUser.logistics_provider_id
          : "",
      user_id: "",
      identity_document: "",
      driving_license: "",
      date_of_birth: "",
      emergency_contact: {
        name: "",
        phone: "",
        relationship: "",
      },
      vehicle_id: "",
      work_zone: "",
    },
  });

  const hasOwnVehicle = form.watch("has_own_vehicle");

  // Establecer automáticamente el logistics_provider_id cuando se crea un nuevo driver
  // y el usuario es LOGISTICS_PROVIDER o SUPERVISOR
  useEffect(() => {
    if (
      !isEditing &&
      shouldHideLogisticsProviderField &&
      currentUser?.logistics_provider_id
    ) {
      form.setValue("logistics_provider_id", currentUser.logistics_provider_id);
    }
  }, [isEditing, shouldHideLogisticsProviderField, currentUser, form]);

  useEffect(() => {
    if (driver && isEditing) {
      form.reset({
        logistics_provider_id: driver.logistics_provider_id,
        user_id: driver.user_id,
        identity_document: driver.identity_document,
        driving_license: driver.driving_license,
        date_of_birth: driver.date_of_birth.split("T")[0],
        emergency_contact: driver.emergency_contact as {
          name: string;
          phone: string;
          relationship?: string;
        },
        has_own_vehicle: driver.has_own_vehicle,
        vehicle_id: driver.vehicle_id || "",
        work_type: driver.work_type,
        work_zone: driver.work_zone || "",
        availability_status: driver.availability_status,
        documents: driver.documents || {},
      });
    }
  }, [driver, isEditing, form]);

  const onSubmit = async (data: DriverFormData) => {
    try {
      const submitData = {
        ...data,
        vehicle_id: data.has_own_vehicle
          ? data.vehicle_id || undefined
          : undefined,
        documents: data.documents || {},
      };

      if (isEditing && driverId) {
        await updateDriver.mutateAsync({
          id: driverId,
          data: submitData,
        });
        toast({
          title: "Driver actualizado",
          description: "El driver ha sido actualizado exitosamente.",
        });
      } else {
        await createDriver.mutateAsync(submitData);
        toast({
          title: "Driver creado",
          description: "El driver ha sido creado exitosamente.",
        });
      }
      router.push("/drivers");
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Hubo un error al guardar el driver.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingDriver && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando driver...</p>
        </div>
      </div>
    );
  }

  const isPending = createDriver?.isPending || updateDriver?.isPending || false;

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Driver" : "Nuevo Driver"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Actualiza la información del driver"
            : "Crea un nuevo driver en el sistema"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Campo oculto para LOGISTICS_PROVIDER y SUPERVISOR */}
            {shouldHideLogisticsProviderField && (
              <FormField
                control={form.control}
                name="logistics_provider_id"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input type="hidden" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <div
              className={`grid grid-cols-1 ${
                shouldHideLogisticsProviderField
                  ? "md:grid-cols-1"
                  : "md:grid-cols-2"
              } gap-4`}
            >
              {!shouldHideLogisticsProviderField && (
                <FormField
                  control={form.control}
                  name="logistics_provider_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proveedor Logístico *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un proveedor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {logisticsProviders?.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              {provider.company_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un usuario" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.isArray(users?.data) && users.data.length > 0 ? (
                          users.data.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.first_name} {user.last_name} ({user.email})
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No hay usuarios DRIVER disponibles. Crea un usuario
                            con rol DRIVER primero.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="identity_document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Documento de Identidad *</FormLabel>
                    <FormControl>
                      <Input disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="driving_license"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Licencia de Conducir *</FormLabel>
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
              name="date_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Nacimiento *</FormLabel>
                  <FormControl>
                    <Input type="date" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium">Contacto de Emergencia</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="emergency_contact.name"
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
                  name="emergency_contact.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono *</FormLabel>
                      <FormControl>
                        <Input disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergency_contact.relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relación</FormLabel>
                      <FormControl>
                        <Input disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="has_own_vehicle"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Tiene vehículo propio</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {hasOwnVehicle && (
              <FormField
                control={form.control}
                name="vehicle_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehículo *</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value || undefined)
                      }
                      value={field.value || undefined}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un vehículo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicles?.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.license_plate} - {vehicle.brand}{" "}
                            {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="work_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Trabajo *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FULL_TIME">
                          Tiempo Completo
                        </SelectItem>
                        <SelectItem value="PART_TIME">Medio Tiempo</SelectItem>
                        <SelectItem value="FREELANCE">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="availability_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado de Disponibilidad *</FormLabel>
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
                        <SelectItem value="AVAILABLE">Disponible</SelectItem>
                        <SelectItem value="BUSY">Ocupado</SelectItem>
                        <SelectItem value="OFFLINE">Desconectado</SelectItem>
                        <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="work_zone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zona de Trabajo</FormLabel>
                  <FormControl>
                    <Input disabled={isPending} {...field} />
                  </FormControl>
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
