'use client';

import { useParams, useRouter } from 'next/navigation';
import { useLogisticsProvider, useDeleteLogisticsProvider } from '@/lib/hooks/use-logistics-providers';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { LogisticsProviderForm } from '@/components/logistics-providers/logistics-provider-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function LogisticsProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = params.id as string;
  const { data: provider, isLoading, error } = useLogisticsProvider(providerId);
  const deleteProvider = useDeleteLogisticsProvider();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!provider) return;

    try {
      await deleteProvider.mutateAsync(providerId);
      toast({
        title: 'Proveedor eliminado',
        description: 'El proveedor ha sido eliminado exitosamente.',
      });
      router.push('/logistics-providers');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando proveedor...</p>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">Error al cargar el proveedor o proveedor no encontrado.</p>
            <Link href="/logistics-providers">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PermissionGuard
      resource="logistics-providers"
      action="read"
      fallback={<div>No tienes permisos para acceder a esta página</div>}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/logistics-providers">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{provider.company_name}</h1>
              <p className="text-muted-foreground mt-2">Detalle del proveedor logístico</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
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
                <LogisticsProviderForm initialData={provider} />
              </DialogContent>
            </Dialog>
            {provider && (
              <ConfirmDialog
                trigger={
                  <Button variant="destructive" disabled={deleteProvider.isPending}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                }
                title="Eliminar Proveedor"
                description={`¿Estás seguro de que quieres eliminar el proveedor "${provider.company_name}"? Esta acción no se puede deshacer.`}
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                variant="destructive"
                onConfirm={handleDelete}
              />
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre de la Empresa</p>
                <p className="font-medium">{provider.company_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Identificador Fiscal</p>
                <p className="font-medium">{provider.tax_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
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
              </div>
              {!provider.tenant_id && (
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <Badge variant="outline">Proveedor Global</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Representante Legal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">{provider.representative_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Documento</p>
                <p className="font-medium">{provider.representative_document}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium">{provider.representative_phone}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verificación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Estado de Verificación</p>
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
              </div>
              {provider.verification_documents &&
                Object.keys(provider.verification_documents).length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Documentos de Verificación</p>
                    <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                      {JSON.stringify(provider.verification_documents, null, 2)}
                    </pre>
                  </div>
                )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información Adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Creado</p>
                <p className="font-medium">{formatDate(provider.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Actualizado</p>
                <p className="font-medium">{formatDate(provider.updated_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PermissionGuard>
  );
}

