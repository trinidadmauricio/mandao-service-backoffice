"use client";

import { useState, useEffect, useRef } from "react";
import { useDrivers } from "@/lib/hooks/use-drivers";
import { useAssignDriver } from "@/lib/hooks/use-orders";
import { useAuth } from "@/lib/hooks/use-auth";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { USER_ROLE } from "@/lib/constants/roles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/use-toast";
import { Truck, AlertCircle } from "lucide-react";

interface AssignDriverDialogProps {
  orderId: string;
  buttonSize?: "default" | "sm" | "lg" | "icon";
  buttonClassName?: string;
  hasDriver?: boolean;
}

export function AssignDriverDialog({
  orderId,
  buttonSize = "default",
  buttonClassName,
  hasDriver = false,
}: AssignDriverDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const { user } = useAuth();
  const { role } = usePermissions();

  // Para LOGISTICS_PROVIDER y SUPERVISOR, filtrar por su logistics_provider_id
  // Para SAAS roles, no filtrar (pueden ver todos los drivers)
  const isLogisticsRole =
    role === USER_ROLE.LOGISTICS_PROVIDER || role === USER_ROLE.SUPERVISOR;
  const logisticsProviderId = isLogisticsRole
    ? user?.logistics_provider_id
    : undefined;

  // Filtrar solo drivers disponibles desde el backend
  const { data: driversResponse, isLoading: isLoadingDrivers } = useDrivers({
    availability_status: "AVAILABLE",
    ...(logisticsProviderId && { logistics_provider_id: logisticsProviderId }),
  });
  const assignDriver = useAssignDriver();
  const { toast } = useToast();

  // Resetear formulario solo cuando el diálogo se cierra completamente
  // No resetear cuando el popover del combobox se cierra
  const previousOpenRef = useRef(open);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    // Solo resetear si el diálogo pasó de abierto a cerrado (no cuando el popover se cierra)
    if (previousOpenRef.current && !open && !isSubmittingRef.current) {
      setSelectedDriverId("");
    }
    previousOpenRef.current = open;
    isSubmittingRef.current = false;
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedDriverId) return;

    isSubmittingRef.current = true;
    try {
      await assignDriver.mutateAsync({
        orderId,
        driverId: selectedDriverId,
      });
      toast({
        title: "Driver asignado",
        description: "El driver ha sido asignado exitosamente a la orden.",
      });
      setSelectedDriverId("");
      setOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al asignar el driver. Por favor, intenta nuevamente.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      isSubmittingRef.current = false;
    }
  };

  // El backend ya filtra por availability_status='AVAILABLE', así que usamos todos los drivers que retorna
  const availableDrivers = driversResponse?.data || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size={buttonSize} className={buttonClassName}>
          <Truck className="h-4 w-4 mr-2" />
          {hasDriver ? "Cambiar Driver" : "Asignar Driver"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {hasDriver ? "Cambiar Driver" : "Asignar Driver"}
          </DialogTitle>
          <DialogDescription>
            {hasDriver
              ? "Selecciona un nuevo driver para esta orden. El driver actual será reemplazado."
              : "Selecciona un driver para asignar a esta orden."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="driver">Driver</Label>
            {isLoadingDrivers ? (
              <Skeleton className="h-10 w-full" />
            ) : availableDrivers.length === 0 ? (
              <EmptyState
                variant="empty"
                title="No hay drivers disponibles"
                description="No hay drivers disponibles para asignar a esta orden."
                icon={<AlertCircle className="h-8 w-8 text-muted-foreground" />}
                className="py-4"
              />
            ) : (
              <Combobox
                options={availableDrivers.map((driver) => ({
                  value: driver.id,
                  label: `${driver.user?.first_name || "N/A"} ${
                    driver.user?.last_name || ""
                  } - ${driver.user?.email || driver.driving_license}`, // Para búsqueda
                  displayLabel: `${driver.user?.first_name || "N/A"} ${
                    driver.user?.last_name || ""
                  }`, // Solo nombre para mostrar
                }))}
                value={selectedDriverId}
                onValueChange={setSelectedDriverId}
                placeholder="Buscar y seleccionar un driver..."
                searchPlaceholder="Buscar driver por nombre o email..."
                emptyMessage="No se encontraron drivers."
                disabled={assignDriver.isPending}
              />
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={assignDriver.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !selectedDriverId ||
                assignDriver.isPending ||
                availableDrivers.length === 0
              }
            >
              {assignDriver.isPending ? "Asignando..." : "Asignar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
