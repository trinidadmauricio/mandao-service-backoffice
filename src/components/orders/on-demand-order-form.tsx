"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateOnDemandOrder } from "@/lib/hooks/use-orders";
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
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Trash2 } from "lucide-react";
import { LocationPicker } from "@/components/shared/location-picker";

const onDemandOrderSchema = z.object({
  customer_snapshot: z.object({
    name: z.string().min(1, "El nombre es requerido"),
    email: z
      .string()
      .email("El email debe ser válido")
      .optional()
      .or(z.literal("")),
    phone: z.string().min(1, "El teléfono es requerido"),
  }),
  delivery_address: z.object({
    street: z.string().min(1, "La calle es requerida"),
    city: z.string().min(1, "La ciudad es requerida"),
    state: z.string().optional(),
    zip_code: z.string().optional(),
    country: z.string().min(1, "El país es requerido"),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  pickup_address: z
    .union([
      z.object({
        street: z.string().min(1),
        city: z.string().min(1),
        state: z.string().optional(),
        zip_code: z.string().optional(),
        country: z.string().min(1),
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
      }),
      z.undefined(),
      z.null(),
    ])
    .optional()
    .nullable(),
  items: z
    .array(
      z.object({
        product_snapshot: z.object({
          name: z.string().min(1, "El nombre del producto es requerido"),
          price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
          currency: z
            .string()
            .length(3, "El código de moneda debe tener 3 caracteres"),
        }),
        quantity: z.number().min(0.001, "La cantidad debe ser mayor a 0"),
        unit_price: z
          .number()
          .min(0, "El precio unitario debe ser mayor o igual a 0"),
        notes: z.string().optional(),
      })
    )
    .min(1, "Debe agregar al menos un item"),
  special_instructions: z.string().optional(),
  scheduled_pickup_at: z.string().optional().or(z.literal("")),
  estimated_delivery_at: z
    .string()
    .min(1, "La fecha de entrega estimada es requerida"),
  priority: z.enum(["NORMAL", "URGENT"]).default("NORMAL"),
  cargo_description: z.string().optional(),
}).superRefine((data, ctx) => {
  // Validar pickup_address solo si tiene algún valor válido (no undefined, null, o objeto vacío)
  // Si está presente pero incompleto, validar campos requeridos
  if (
    data.pickup_address !== undefined && 
    data.pickup_address !== null &&
    typeof data.pickup_address === 'object' &&
    !Array.isArray(data.pickup_address)
  ) {
    const pickup = data.pickup_address;
    // Solo validar si al menos un campo tiene valor (para evitar validar objetos vacíos del autocompletado)
    const hasAnyValue = 
      (pickup.street && pickup.street.trim() !== "") ||
      (pickup.city && pickup.city.trim() !== "") ||
      (pickup.country && pickup.country.trim() !== "") ||
      (typeof pickup.lat === "number" && !isNaN(pickup.lat) && pickup.lat !== 0) ||
      (typeof pickup.lng === "number" && !isNaN(pickup.lng) && pickup.lng !== 0);
    
    // Si tiene algún valor, validar que todos los campos requeridos estén presentes
    if (hasAnyValue) {
      if (!pickup.street || pickup.street.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La calle es requerida",
          path: ["pickup_address", "street"],
        });
      }
      if (!pickup.city || pickup.city.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La ciudad es requerida",
          path: ["pickup_address", "city"],
        });
      }
      if (!pickup.country || pickup.country.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El país es requerido",
          path: ["pickup_address", "country"],
        });
      }
      if (typeof pickup.lat !== "number" || isNaN(pickup.lat) || pickup.lat === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La latitud es requerida",
          path: ["pickup_address", "lat"],
        });
      }
      if (typeof pickup.lng !== "number" || isNaN(pickup.lng) || pickup.lng === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La longitud es requerida",
          path: ["pickup_address", "lng"],
        });
      }
    }
  }
});

type OnDemandOrderFormData = z.infer<typeof onDemandOrderSchema>;

export function OnDemandOrderForm() {
  const router = useRouter();
  const { toast } = useToast();
  const createOrder = useCreateOnDemandOrder();
  const [hasPickup, setHasPickup] = useState(false);

  const form = useForm<OnDemandOrderFormData>({
    resolver: zodResolver(onDemandOrderSchema),
    defaultValues: {
      priority: "NORMAL",
      items: [
        {
          product_snapshot: {
            name: "",
            price: 0,
            currency: "USD",
          },
          quantity: 1,
          unit_price: 0,
          notes: "",
        },
      ],
      customer_snapshot: {
        name: "",
        email: "",
        phone: "",
      },
      delivery_address: {
        street: "",
        city: "",
        state: "",
        zip_code: "",
        country: "",
        lat: 0,
        lng: 0,
      },
      pickup_address: undefined,
      special_instructions: "",
      scheduled_pickup_at: "",
      estimated_delivery_at: "",
      cargo_description: "",
    },
  });

  const { control } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = async (data: OnDemandOrderFormData) => {
    try {
      // Convertir datetime-local a formato ISO para el backend
      // El backend espera una fecha (z.coerce.date()), así que convertimos a ISO string
      const formatDateTime = (dateTimeString: string): string => {
        if (!dateTimeString) return dateTimeString;
        // Si viene como "2025-11-28T14:32", convertir a ISO completo
        if (dateTimeString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
          // Agregar segundos y timezone
          return `${dateTimeString}:00`;
        }
        // Si ya tiene formato completo, retornarlo
        return dateTimeString;
      };

      const submitData = {
        ...data,
        // Convertir a ISO string para que el backend pueda hacer z.coerce.date()
        estimated_delivery_at: formatDateTime(data.estimated_delivery_at),
        scheduled_pickup_at: data.scheduled_pickup_at ? formatDateTime(data.scheduled_pickup_at) : undefined,
        // Solo incluir pickup_address si hasPickup es true y tiene valores válidos
        pickup_address: hasPickup && data.pickup_address && 
          data.pickup_address.street && 
          data.pickup_address.city && 
          data.pickup_address.country &&
          typeof data.pickup_address.lat === 'number' &&
          typeof data.pickup_address.lng === 'number'
          ? data.pickup_address 
          : undefined,
        special_instructions: data.special_instructions || undefined,
        cargo_description: data.cargo_description || undefined,
        customer_snapshot: {
          ...data.customer_snapshot,
          email: data.customer_snapshot.email || undefined,
        },
      };

      const result = await createOrder.mutateAsync(submitData);
      toast({
        title: "Orden creada",
        description: `Orden ${result.order_display_number} creada exitosamente. Tracking: ${result.tracking_code}`,
      });
      router.push(`/orders/${result.order.id}`);
    } catch (error: unknown) {
      console.error('Error al crear orden:', error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Hubo un error al crear la orden.",
        variant: "destructive",
      });
    }
  };

  const isPending = createOrder.isPending;

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Nueva Orden On-Demand</CardTitle>
        <CardDescription>
          Crea una orden de entrega sin productos del catálogo (last-mile
          delivery)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              // Mostrar errores de validación en consola para debugging
              console.error('Errores de validación:', errors);
              // Mostrar toast con errores
              const firstError = Object.values(errors)[0];
              if (firstError) {
                toast({
                  title: "Error de validación",
                  description: firstError.message || "Por favor, revisa los campos del formulario.",
                  variant: "destructive",
                });
              }
            })} 
            className="space-y-6"
          >
            {/* Customer Snapshot */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium">Información del Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="customer_snapshot.name"
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
                  name="customer_snapshot.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customer_snapshot.phone"
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
              </div>
            </div>

            {/* Delivery Address */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium">Dirección de Entrega</h3>
              
              {/* Location Picker */}
              <FormField
                control={form.control}
                name="delivery_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación en el Mapa *</FormLabel>
                    <FormControl>
                      <LocationPicker
                        lat={field.value?.lat}
                        lng={field.value?.lng}
                        onLocationChange={(lat, lng, address) => {
                          field.onChange({
                            ...field.value,
                            lat,
                            lng,
                            street: address?.street || field.value?.street || '',
                            city: address?.city || field.value?.city || '',
                            state: address?.state || field.value?.state || '',
                            zip_code: address?.zip_code || field.value?.zip_code || '',
                            country: address?.country || field.value?.country || '',
                          });
                        }}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campos de dirección (se llenan automáticamente desde el mapa) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="delivery_address.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calle *</FormLabel>
                      <FormControl>
                        <Input disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="delivery_address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad *</FormLabel>
                      <FormControl>
                        <Input disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="delivery_address.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado/Provincia</FormLabel>
                      <FormControl>
                        <Input disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="delivery_address.zip_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código Postal</FormLabel>
                      <FormControl>
                        <Input disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="delivery_address.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País *</FormLabel>
                      <FormControl>
                        <Input disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Pickup Address (Optional) */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_pickup"
                  checked={hasPickup}
                  onCheckedChange={(checked) => {
                    const newValue = !!checked;
                    setHasPickup(newValue);
                    // Limpiar pickup_address cuando se desmarca el checkbox
                    if (!newValue) {
                      form.setValue("pickup_address", undefined);
                      // Limpiar errores de validación de pickup_address
                      form.clearErrors("pickup_address");
                    } else {
                      // Inicializar pickup_address cuando se marca el checkbox
                      form.setValue("pickup_address", {
                        street: "",
                        city: "",
                        state: "",
                        zip_code: "",
                        country: "",
                        lat: 0,
                        lng: 0,
                      });
                    }
                  }}
                  disabled={isPending}
                />
                <FormLabel htmlFor="has_pickup" className="cursor-pointer">
                  Tiene dirección de recogida
                </FormLabel>
              </div>
            </div>

            {hasPickup && (
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-medium">Dirección de Recogida</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pickup_address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calle *</FormLabel>
                        <FormControl>
                          <Input disabled={isPending} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pickup_address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciudad *</FormLabel>
                        <FormControl>
                          <Input disabled={isPending} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pickup_address.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>País *</FormLabel>
                        <FormControl>
                          <Input disabled={isPending} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="pickup_address.lat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitud *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="any"
                              disabled={isPending}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pickup_address.lng"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitud *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="any"
                              disabled={isPending}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Items</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      product_snapshot: { name: "", price: 0, currency: "USD" },
                      quantity: 1,
                      unit_price: 0,
                      notes: "",
                    })
                  }
                  disabled={isPending}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Item
                </Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.product_snapshot.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Producto *</FormLabel>
                          <FormControl>
                            <Input disabled={isPending} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.product_snapshot.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              disabled={isPending}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.product_snapshot.currency`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Moneda *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || "USD"}
                            disabled={isPending}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona una moneda" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
                              <SelectItem value="EUR">EUR - Euro</SelectItem>
                              <SelectItem value="GTQ">GTQ - Quetzal Guatemalteco</SelectItem>
                              <SelectItem value="HNL">HNL - Lempira Hondureño</SelectItem>
                              <SelectItem value="NIO">NIO - Córdoba Nicaragüense</SelectItem>
                              <SelectItem value="CRC">CRC - Colón Costarricense</SelectItem>
                              <SelectItem value="PAB">PAB - Balboa Panameño</SelectItem>
                              <SelectItem value="SVC">SVC - Colón Salvadoreño</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cantidad *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.001"
                              disabled={isPending}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.unit_price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio Unitario *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              disabled={isPending}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.notes`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-3">
                          <FormLabel>Notas</FormLabel>
                          <FormControl>
                            <Input disabled={isPending} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
              {form.formState.errors.items && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.items.message}
                </p>
              )}
            </div>

            {/* Other Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimated_delivery_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Entrega Estimada *</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scheduled_pickup_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Recogida Programada</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        disabled={isPending}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una prioridad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="URGENT">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cargo_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción de Carga</FormLabel>
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
              name="special_instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instrucciones Especiales</FormLabel>
                  <FormControl>
                    <Textarea disabled={isPending} {...field} />
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
                {isPending ? "Creando..." : "Crear Orden"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
