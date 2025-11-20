'use client';

import { useState } from 'react';
import { useLogisticsProviders, useDeleteLogisticsProvider } from '@/lib/hooks/use-logistics-providers';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/date';
import { LogisticsProviderForm } from '@/components/logistics-providers/logistics-provider-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

export default function LogisticsProvidersPage() {
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { data: providers, isLoading, error } = useLogisticsProviders();
  const deleteProvider = useDeleteLogisticsProvider();
  const { toast } = useToast();

  const handleDelete = async (id: string, companyName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el proveedor "${companyName}"?`)) {
      return;
    }

    try {
      await deleteProvider.mutateAsync(id);
      toast({
        title: 'Proveedor eliminado',
        description: 'El proveedor ha sido eliminado exitosamente.',
      });
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Hubo un error al eliminar el proveedor.',
        variant: 'destructive',
      });
    }
  };

  const statusLabels: Record<string, string> = {
    ACTIVE: 'Activo',
    SUSPENDED: 'Suspendido',
    INACTIVE: 'Inactivo',
  };

  const verificationLabels: Record<string, string> = {
    PENDING: 'Pendiente',
    VERIFIED: 'Verificado',
    REJECTED: 'Rechazado',
  };

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
            <p className="mt-4 text-muted-foreground">Cargando proveedores...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">Error al cargar los proveedores logísticos.</p>
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
                    Crea un nuevo proveedor logístico para gestionar entregas externas.
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
              <CardTitle>Lista de Proveedores</CardTitle>
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
                            <p className="font-medium">{provider.company_name}</p>
                            <Badge
                              variant={
                                provider.status === 'ACTIVE'
                                  ? 'default'
                                  : provider.status === 'SUSPENDED'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {statusLabels[provider.status] || provider.status}
                            </Badge>
                            <Badge
                              variant={
                                provider.verification_status === 'VERIFIED'
                                  ? 'default'
                                  : provider.verification_status === 'REJECTED'
                                  ? 'destructive'
                                  : 'outline'
                              }
                            >
                              {verificationLabels[provider.verification_status] ||
                                provider.verification_status}
                            </Badge>
                            {!provider.tenant_id && (
                              <Badge variant="outline">Global</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            RUC/NIT: {provider.tax_id} | Representante: {provider.representative_name}
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
                          onOpenChange={(open) => setEditingProvider(open ? provider.id : null)}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Editar Proveedor Logístico</DialogTitle>
                              <DialogDescription>
                                Actualiza la información del proveedor logístico.
                              </DialogDescription>
                            </DialogHeader>
                            <LogisticsProviderForm
                              initialData={provider}
                              onSuccess={() => setEditingProvider(null)}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(provider.id, provider.company_name)}
                          disabled={deleteProvider.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
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

