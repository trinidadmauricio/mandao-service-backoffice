"use client";

import { useParams } from "next/navigation";
import { useOrder } from "@/lib/hooks/use-orders";
import { PermissionGuard } from "@/components/auth/permission-guard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { CargoSizeBadge } from "@/components/orders/cargo-size-badge";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils/date";
import { formatCurrency, type CurrencyCode } from "@/lib/utils/currency";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { USER_ROLE } from "@/lib/constants/roles";
import { AssignDriverDialog } from "@/components/orders/assign-driver-dialog";
import { ChangeBranchDialog } from "@/components/orders/change-branch-dialog";
import { ModifyItemsDialog } from "@/components/orders/modify-items-dialog";
import { UpdateStatusDialog } from "@/components/orders/update-status-dialog";
import { CancelOrderDialog } from "@/components/orders/cancel-order-dialog";
import { RecalculateTotalsButton } from "@/components/orders/recalculate-totals-button";
import { OrderTimeline } from "@/components/orders/order-timeline";
import {
  Package,
  User,
  MapPin,
  Truck,
  Building2,
  Calendar,
  DollarSign,
  AlertCircle,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { data: order, isLoading, error } = useOrder(orderId);
  const { hasPermission, role } = usePermissions();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando orden...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">
              Error al cargar la orden o orden no encontrada.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentDriver = order.order_drivers?.find((od) => od.is_current);
  const currentBranch = order.order_branches?.find((ob) => ob.is_current);
  const currentTotal = order.order_summary_totals?.find((t) => t.is_current);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: `${label} copiado al portapapeles`,
    });
  };

  return (
    <PermissionGuard
      resource="orders"
      action="read"
      fallback={<div>No tienes permisos para acceder a esta página</div>}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  Orden {order.order_display_number}
                </h1>
                <OrderStatusBadge status={order.status} />
                <Badge variant="outline" className="text-xs">
                  {order.order_type}
                </Badge>
                {order.cargo_size && (
                  <CargoSizeBadge cargoSize={order.cargo_size} />
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Tracking:</span>
                  <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
                    {order.tracking_code}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() =>
                      copyToClipboard(order.tracking_code, "Código de tracking")
                    }
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {order.priority === "URGENT" && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Urgente
                </Badge>
              )}
            </div>
          </div>

          {/* Action Bar */}
          {hasPermission("orders", "manage") && (
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t">
              <div className="flex flex-wrap items-center gap-2">
                {/* Roles que pueden asignar drivers: SAAS, LOGISTICS_PROVIDER, SUPERVISOR */}
                {(role === USER_ROLE.SAAS_ADMIN ||
                  role === USER_ROLE.SAAS_EDITOR ||
                  role === USER_ROLE.LOGISTICS_PROVIDER ||
                  role === USER_ROLE.SUPERVISOR) && (
                  <AssignDriverDialog
                    orderId={order.id}
                    buttonSize="sm"
                    hasDriver={!!currentDriver}
                  />
                )}
                {order.order_type !== "ON_DEMAND" && (
                  <ChangeBranchDialog
                    orderId={order.id}
                    buttonSize="sm"
                    hasBranch={!!currentBranch}
                  />
                )}
                <ModifyItemsDialog
                  orderId={order.id}
                  orderType={order.order_type}
                  currentItems={order.order_items?.map((item) => ({
                    id: item.id,
                    product_snapshot: item.product_snapshot as Record<
                      string,
                      unknown
                    >,
                    quantity: Number(item.quantity),
                    unit_price: Number(item.unit_price),
                    notes: item.notes || undefined,
                  }))}
                  buttonSize="sm"
                />
                <UpdateStatusDialog
                  orderId={order.id}
                  currentStatus={order.status}
                  buttonSize="sm"
                />
                <RecalculateTotalsButton orderId={order.id} buttonSize="sm" />
              </div>
              {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                <div className="flex items-center gap-2 pl-2 border-l">
                  <CancelOrderDialog
                    orderId={order.id}
                    orderNumber={order.order_display_number}
                    buttonSize="sm"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total
                  </p>
                  <p className="text-2xl font-bold">
                    {currentTotal
                      ? formatCurrency(
                          Number(currentTotal.total_amount),
                          currentTotal.currency as CurrencyCode
                        )
                      : "N/A"}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Items
                  </p>
                  <p className="text-2xl font-bold">
                    {order.order_items?.length || 0}
                  </p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Entrega Estimada
                  </p>
                  <p className="text-sm font-medium">
                    {formatDate(order.estimated_delivery_at)}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Driver
                  </p>
                  <p className="text-sm font-medium">
                    {currentDriver?.driver_user
                      ? `${currentDriver.driver_user.first_name} ${currentDriver.driver_user.last_name}`
                      : "No asignado"}
                  </p>
                </div>
                <Truck className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle>Información de la Orden</CardTitle>
                <CardDescription>
                  Detalles generales de la orden
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Número de Orden
                    </p>
                    <p className="font-medium">{order.order_display_number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Estado
                    </p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Tipo
                    </p>
                    <Badge variant="outline">{order.order_type}</Badge>
                  </div>
                  {order.cargo_size && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Tamaño de Carga
                      </p>
                      <CargoSizeBadge cargoSize={order.cargo_size} />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Prioridad
                    </p>
                    <Badge
                      variant={
                        order.priority === "URGENT" ? "destructive" : "default"
                      }
                    >
                      {order.priority}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Fecha de Creación
                    </p>
                    <p className="font-medium">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Última Actualización
                    </p>
                    <p className="font-medium">
                      {formatDate(order.updated_at)}
                    </p>
                  </div>
                </div>
                {order.scheduled_pickup_at && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Pickup Programado
                      </p>
                      <p className="font-medium">
                        {formatDate(order.scheduled_pickup_at)}
                      </p>
                    </div>
                  </>
                )}
                {order.special_instructions && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Instrucciones Especiales
                      </p>
                      <p className="text-sm">{order.special_instructions}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle>Items de la Orden</CardTitle>
                <CardDescription>
                  {order.order_items?.length || 0}{" "}
                  {order.order_items?.length === 1 ? "item" : "items"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {order.order_items && order.order_items.length > 0 ? (
                  <div className="space-y-3">
                    {order.order_items.map((item) => {
                      const product = item.product_snapshot as Record<
                        string,
                        unknown
                      >;
                      const quantity = Number(item.quantity);
                      const unitPrice = Number(item.unit_price);
                      const subtotal = quantity * unitPrice;
                      const currency = (product.currency as string) || "USD";

                      return (
                        <div
                          key={item.id}
                          className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1 space-y-1">
                            <p className="font-medium">
                              {(product.name as string) || "Producto"}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Cantidad: {quantity}</span>
                              <span>•</span>
                              <span>
                                Precio unitario:{" "}
                                {formatCurrency(
                                  unitPrice,
                                  currency as CurrencyCode
                                )}
                              </span>
                            </div>
                            {item.notes && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                Nota: {String(item.notes)}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {formatCurrency(
                                subtotal,
                                currency as CurrencyCode
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No hay items registrados</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Totals */}
            {currentTotal && (
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Totales</CardTitle>
                  <CardDescription>
                    Versión {currentTotal.version}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        {formatCurrency(
                          Number(currentTotal.subtotal),
                          currentTotal.currency as CurrencyCode
                        )}
                      </span>
                    </div>
                    {Number(currentTotal.tax_amount) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Impuesto ({Number(currentTotal.tax_rate) * 100}%)
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            Number(currentTotal.tax_amount),
                            currentTotal.currency as CurrencyCode
                          )}
                        </span>
                      </div>
                    )}
                    {Number(currentTotal.delivery_fee) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Tarifa de entrega
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            Number(currentTotal.delivery_fee),
                            currentTotal.currency as CurrencyCode
                          )}
                        </span>
                      </div>
                    )}
                    {Number(currentTotal.discount_amount) > 0 && (
                      <div className="flex justify-between text-sm text-destructive">
                        <span>Descuento</span>
                        <span className="font-medium">
                          -
                          {formatCurrency(
                            Number(currentTotal.discount_amount),
                            currentTotal.currency as CurrencyCode
                          )}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-base font-semibold">Total</span>
                      <span className="text-xl font-bold">
                        {formatCurrency(
                          Number(currentTotal.total_amount),
                          currentTotal.currency as CurrencyCode
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar Information */}
          <div className="space-y-6">
            {/* Customer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.customer_snapshot &&
                typeof order.customer_snapshot === "object" ? (
                  <>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Nombre
                      </p>
                      <p className="font-medium">
                        {String(order.customer_snapshot?.name || "N/A")}
                      </p>
                    </div>
                    {order.customer_snapshot?.phone && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Teléfono
                        </p>
                        <p className="font-medium">
                          {String(order.customer_snapshot.phone)}
                        </p>
                      </div>
                    )}
                    {order.customer_snapshot?.email && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Email
                        </p>
                        <p className="font-medium text-sm break-all">
                          {String(order.customer_snapshot.email)}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No hay información del cliente
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Dirección de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.delivery_address &&
                typeof order.delivery_address === "object" ? (
                  <>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Dirección
                      </p>
                      <p className="font-medium text-sm">
                        {String(order.delivery_address?.street || "")}
                        {order.delivery_address?.city
                          ? `, ${String(order.delivery_address.city || "")}`
                          : ""}
                      </p>
                      {order.delivery_address?.state ? (
                        <p className="text-sm text-muted-foreground">
                          {String(order.delivery_address.state || "")}
                        </p>
                      ) : null}
                      {order.delivery_address?.country ? (
                        <p className="text-sm text-muted-foreground">
                          {String(order.delivery_address.country || "")}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Coordenadas
                      </p>
                      <p className="font-mono text-xs">
                        {order.delivery_lat}, {order.delivery_lng}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No hay dirección de entrega
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Driver Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Driver Asignado
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentDriver ? (
                  <div className="space-y-3">
                    {currentDriver.driver_user ? (
                      <>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Nombre
                          </p>
                          <p className="font-medium">
                            {currentDriver.driver_user.first_name}{" "}
                            {currentDriver.driver_user.last_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Email
                          </p>
                          <p className="font-medium text-sm break-all">
                            {currentDriver.driver_user.email}
                          </p>
                        </div>
                        {currentDriver.driver_user.phone && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Teléfono
                            </p>
                            <p className="font-medium">
                              {currentDriver.driver_user.phone}
                            </p>
                          </div>
                        )}
                        <Separator />
                      </>
                    ) : null}
                    {(() => {
                      const driver = currentDriver.driver_snapshot as Record<
                        string,
                        unknown
                      >;
                      return (
                        <>
                          {driver.driving_license && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Licencia
                              </p>
                              <p className="font-medium text-sm">
                                {String(driver.driving_license)}
                              </p>
                            </div>
                          )}
                          {driver.work_type && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Tipo de Trabajo
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {String(driver.work_type)}
                              </Badge>
                            </div>
                          )}
                        </>
                      );
                    })()}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Asignado el
                      </p>
                      <p className="font-medium text-sm">
                        {formatDate(
                          currentDriver.assigned_at || currentDriver.created_at
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Truck className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      No hay driver asignado
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Branch Assignment - Solo para órdenes RETAIL */}
            {order.order_type !== "ON_DEMAND" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Sucursal Asignada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentBranch &&
                  currentBranch.branch_snapshot &&
                  typeof currentBranch.branch_snapshot === "object" ? (
                    (() => {
                      const branch = currentBranch.branch_snapshot as Record<
                        string,
                        unknown
                      >;
                      return (
                        <div className="space-y-3">
                          {branch.name ? (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Nombre
                              </p>
                              <p className="font-medium">
                                {String(branch.name || "")}
                              </p>
                            </div>
                          ) : null}
                          {branch.address ? (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Dirección
                              </p>
                              <p className="font-medium text-sm">
                                {String(branch.address || "")}
                              </p>
                            </div>
                          ) : null}
                          {branch.contact_phone ? (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Teléfono
                              </p>
                              <p className="font-medium text-sm">
                                {String(branch.contact_phone || "")}
                              </p>
                            </div>
                          ) : null}
                          {branch.is_main !== undefined && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Tipo
                              </p>
                              <Badge
                                variant={branch.is_main ? "default" : "outline"}
                                className="text-xs"
                              >
                                {branch.is_main ? "Principal" : "Secundaria"}
                              </Badge>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Asignada el
                            </p>
                            <p className="font-medium text-sm">
                              {formatDate(
                                currentBranch.assigned_at ||
                                  currentBranch.created_at
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-center py-4">
                      <Building2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground">
                        No hay sucursal asignada
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Timeline */}
        {order && <OrderTimeline order={order} />}
      </div>
    </PermissionGuard>
  );
}
