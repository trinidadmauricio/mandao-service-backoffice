"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateRetailOrder } from "@/lib/hooks/use-orders";
import { useProducts } from "@/lib/hooks/use-products";
import { useBranches } from "@/lib/hooks/use-branches";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { LocationPicker } from "@/components/shared/location-picker";

const retailOrderSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().uuid().optional(),
        variant_id: z.string().uuid().optional(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, "Debe tener al menos un item"),
  customer_snapshot: z.object({
    name: z.string().min(1, "El nombre es requerido"),
    phone: z.string().min(1, "El teléfono es requerido"),
    email: z.string().email("Email inválido").optional(),
  }),
  delivery_address: z.object({
    street: z.string().min(1, "La calle es requerida"),
    city: z.string().min(1, "La ciudad es requerida"),
    state: z.string().optional(),
    zip_code: z.string().optional(),
    country: z.string().min(1, "El país es requerido"),
    lat: z.number(),
    lng: z.number(),
  }),
  branch_id: z.string().uuid("El branch es requerido"),
  estimated_delivery_at: z.string().datetime(),
});

type RetailOrderFormData = z.infer<typeof retailOrderSchema>;

export function CreateOrderRetailForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const createOrder = useCreateRetailOrder();
  const { data: products } = useProducts();
  const { data: branches } = useBranches();

  const form = useForm<RetailOrderFormData>({
    resolver: zodResolver(retailOrderSchema),
    defaultValues: {
      items: [{ quantity: 1, product_id: "", variant_id: "" }],
      customer_snapshot: {
        name: "",
        phone: "",
        email: "",
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
      branch_id: "",
      estimated_delivery_at: "",
    },
  });

  const items = form.watch("items");

  const onSubmit = async (data: RetailOrderFormData) => {
    setError(null);

    try {
      const result = await createOrder.mutateAsync(data);
      router.push(`/orders/${result.order_id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al crear la orden. Por favor, intenta nuevamente."
      );
    }
  };

  const addItem = () => {
    const currentItems = form.getValues("items");
    form.setValue("items", [
      ...currentItems,
      { quantity: 1, product_id: "", variant_id: "" },
    ]);
  };

  const removeItem = (index: number) => {
    const currentItems = form.getValues("items");
    form.setValue(
      "items",
      currentItems.filter((_, i) => i !== index)
    );
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Crear Orden Retail</CardTitle>
        <CardDescription>
          Crear una nueva orden con productos del catálogo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información del Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customer_snapshot.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input disabled={createOrder.isPending} {...field} />
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
                        <Input disabled={createOrder.isPending} {...field} />
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
                      <FormLabel>Email (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          disabled={createOrder.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sucursal</h3>
              <FormField
                control={form.control}
                name="branch_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sucursal *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={createOrder.isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una sucursal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {branches?.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dirección de Entrega</h3>

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
                            street:
                              address?.street || field.value?.street || "",
                            city: address?.city || field.value?.city || "",
                            state: address?.state || field.value?.state || "",
                            zip_code:
                              address?.zip_code || field.value?.zip_code || "",
                            country:
                              address?.country || field.value?.country || "",
                          });
                        }}
                        disabled={createOrder.isPending}
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
                        <Input disabled={createOrder.isPending} {...field} />
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
                        <Input disabled={createOrder.isPending} {...field} />
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
                        <Input disabled={createOrder.isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Productos</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  Agregar Producto
                </Button>
              </div>
              {items.map((_item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Producto {index + 1}</h4>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.product_id`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Producto</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(value || undefined)
                            }
                            value={field.value || undefined}
                            disabled={createOrder.isPending}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un producto" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products?.data?.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
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
                              min="1"
                              disabled={createOrder.isPending}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
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

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información Adicional</h3>
              <FormField
                control={form.control}
                name="estimated_delivery_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha Estimada de Entrega *</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        disabled={createOrder.isPending}
                        {...field}
                      />
                    </FormControl>
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
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createOrder.isPending}>
                {createOrder.isPending ? "Creando..." : "Crear Orden"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
