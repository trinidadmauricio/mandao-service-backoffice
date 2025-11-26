"use client";

import { useState, useEffect } from "react";
import {
  useLogisticsProviders,
  useDeleteLogisticsProvider,
  type LogisticsProvidersFilters,
} from "@/lib/hooks/use-logistics-providers";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Eye, Edit, Trash2, Search } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/date";
import { LogisticsProviderForm } from "@/components/logistics-providers/logistics-provider-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useDebounce } from "@/lib/hooks/use-debounce";

export default function LogisticsProvidersPage() {
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<LogisticsProvidersFilters>({});

  // Debounce search term
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Update filters when debounced search changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: debouncedSearch || undefined,
    }));
  }, [debouncedSearch]);

  const { data: providers, isLoading, error } = useLogisticsProviders(filters);
  const deleteProvider = useDeleteLogisticsProvider();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      await deleteProvider.mutateAsync(id);
      toast({
        title: "Proveedor eliminado",
        description: "El proveedor ha sido eliminado exitosamente.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Hubo un error al eliminar el proveedor.",
        variant: "destructive",
      });
    }
  };

  const statusLabels: Record<string, string> = {
    ACTIVE: "Activo",
    SUSPENDED: "Suspendido",
    INACTIVE: "Inactivo",
  };

  const verificationLabels: Record<string, string> = {
    PENDING: "Pendiente",
    VERIFIED: "Verificado",
    REJECTED: "Rechazado",
  };

  const statusOptions: Array<{
    value: LogisticsProvidersFilters["status"];
    label: string;
  }> = [
    { value: undefined, label: "Todos" },
    { value: "ACTIVE", label: "Activo" },
    { value: "SUSPENDED", label: "Suspendido" },
    { value: "INACTIVE", label: "Inactivo" },
  ];

  const verificationStatusOptions: Array<{
    value: LogisticsProvidersFilters["verification_status"];
    label: string;
  }> = [
    { value: undefined, label: "Todos" },
    { value: "PENDING", label: "Pendiente" },
    { value: "VERIFIED", label: "Verificado" },
    { value: "REJECTED", label: "Rechazado" },
  ];

  return (
    <PermissionGuard
      resource="logistics-providers"
      action="read"
      fallback={<div>No tienes permisos para acceder a esta página</div>}
    >
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              Cargando proveedores...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">
                Error al cargar los proveedores logísticos.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Proveedores Logísticos</h1>
              <p className="text-muted-foreground mt-2">
                Gestiona los proveedores logísticos externos
              </p>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Proveedor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Proveedor Logístico</DialogTitle>
                  <DialogDescription>
                    Crea un nuevo proveedor logístico para gestionar entregas
                    externas.
                  </DialogDescription>
                </DialogHeader>
                <LogisticsProviderForm
                  onSuccess={() => setCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lista de Proveedores</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre, RUC/NIT o representante..."
                      className="pl-8 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select
                    value={filters.status || "all"}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        status:
                          value === "all"
                            ? undefined
                            : (value as LogisticsProvidersFilters["status"]),
                      })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem
                          key={option.value || "all"}
                          value={option.value || "all"}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.verification_status || "all"}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        verification_status:
                          value === "all"
                            ? undefined
                            : (value as LogisticsProvidersFilters["verification_status"]),
                      })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por verificación" />
                    </SelectTrigger>
                    <SelectContent>
                      {verificationStatusOptions.map((option) => (
                        <SelectItem
                          key={option.value || "all"}
                          value={option.value || "all"}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {providers && providers.length > 0 ? (
                <div className="space-y-4">
                  {providers.map((provider) => (
                    <div
                      key={provider.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">
                              {provider.company_name}
                            </p>
                            <Badge
                              variant={
                                provider.status === "ACTIVE"
                                  ? "default"
                                  : provider.status === "SUSPENDED"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {statusLabels[provider.status] || provider.status}
                            </Badge>
                            <Badge
                              variant={
                                provider.verification_status === "VERIFIED"
                                  ? "default"
                                  : provider.verification_status === "REJECTED"
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              {verificationLabels[
                                provider.verification_status
                              ] || provider.verification_status}
                            </Badge>
                            {!provider.tenant_id && (
                              <Badge variant="outline">Global</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            RUC/NIT: {provider.tax_id} | Representante:{" "}
                            {provider.representative_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Creado: {formatDate(provider.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/logistics-providers/${provider.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver
                          </Button>
                        </Link>
                        <Dialog
                          open={editingProvider === provider.id}
                          onOpenChange={(open) =>
                            setEditingProvider(open ? provider.id : null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                Editar Proveedor Logístico
                              </DialogTitle>
                              <DialogDescription>
                                Actualiza la información del proveedor
                                logístico.
                              </DialogDescription>
                            </DialogHeader>
                            <LogisticsProviderForm
                              initialData={provider}
                              onSuccess={() => setEditingProvider(null)}
                            />
                          </DialogContent>
                        </Dialog>
                        <ConfirmDialog
                          trigger={
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={deleteProvider.isPending}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </Button>
                          }
                          title="Eliminar Proveedor"
                          description={`¿Estás seguro de que quieres eliminar el proveedor "${provider.company_name}"? Esta acción no se puede deshacer.`}
                          confirmLabel="Eliminar"
                          cancelLabel="Cancelar"
                          variant="destructive"
                          onConfirm={() => handleDelete(provider.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay proveedores logísticos registrados
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </PermissionGuard>
  );
}
