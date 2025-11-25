'use client';

import { useState, useMemo, useCallback } from 'react';
import { useDrivers, useDeleteDriver, type DriversFilters } from '@/lib/hooks/use-drivers';
import { RoleGuard } from '@/components/auth/role-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/use-toast';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { usePermissions } from '@/lib/hooks/use-permissions';
import type { Driver } from '@/types/api';

export default function DriversPage() {
  const [filters, setFilters] = useState<DriversFilters>({
    page: 1,
    limit: 10,
    search: '',
  });
  const { data: driversResponse, isLoading, error } = useDrivers(filters);
  const deleteDriver = useDeleteDriver();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();

  const drivers = driversResponse?.data || [];
  const totalCount = driversResponse?.total;

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteDriver.mutateAsync(id);
      toast({
        title: 'Driver eliminado',
        description: 'El driver ha sido eliminado exitosamente.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el driver. Por favor, intenta nuevamente.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [deleteDriver, toast]);

  const columns: ColumnDef<Driver>[] = useMemo(
    () => [
      {
        accessorKey: 'user',
        header: 'Conductor',
        cell: ({ row }) => {
          const driver = row.original;
          return (
            <div>
              <p className="font-medium">
                {driver.user?.first_name || 'N/A'} {driver.user?.last_name || ''}
              </p>
              {driver.user?.email && (
                <p className="text-sm text-muted-foreground">{driver.user.email}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Licencia: {driver.driving_license}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: 'availability_status',
        header: 'Estado',
        cell: ({ row }) => {
          const status = row.original.availability_status;
          const statusMap = {
            AVAILABLE: { label: 'Disponible', variant: 'success' as const },
            BUSY: { label: 'Ocupado', variant: 'warning' as const },
            OFFLINE: { label: 'Desconectado', variant: 'outline' as const },
            SUSPENDED: { label: 'Suspendido', variant: 'destructive' as const },
          };
          const statusInfo = statusMap[status] || statusMap.OFFLINE;
          return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
        },
      },
      {
        accessorKey: 'work_type',
        header: 'Tipo de Trabajo',
        cell: ({ row }) => {
          const workType = row.original.work_type;
          const workTypeMap = {
            FULL_TIME: 'Tiempo Completo',
            PART_TIME: 'Medio Tiempo',
            FREELANCE: 'Freelance',
          };
          return workTypeMap[workType] || workType;
        },
      },
      {
        accessorKey: 'total_deliveries',
        header: 'Entregas',
        cell: ({ row }) => {
          return row.original.total_deliveries || 0;
        },
      },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
          const driver = row.original;
          return (
            <div className="flex items-center space-x-2">
              {hasPermission('drivers', 'update') && (
                <Link href={`/drivers/${driver.id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </Link>
              )}
              {hasPermission('drivers', 'delete') && (
                <ConfirmDialog
                  trigger={
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleteDriver.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  }
                  title="Eliminar Driver"
                  description={`¿Estás seguro de que quieres eliminar el driver "${driver.user?.first_name || 'N/A'} ${driver.user?.last_name || ''}"? Esta acción no se puede deshacer.`}
                  confirmLabel="Eliminar"
                  cancelLabel="Cancelar"
                  variant="destructive"
                  onConfirm={() => handleDelete(driver.id)}
                />
              )}
            </div>
          );
        },
      },
    ],
    [hasPermission, deleteDriver.isPending, handleDelete]
  );

  return (
    <RoleGuard
      allowedRoles={['OWNER', 'SUPERVISOR', 'LOGISTICS_PROVIDER']}
      requiredPermission={{ resource: 'drivers', action: 'read' }}
      fallback={<div>No tienes permisos para acceder a esta página</div>}
    >
      {error ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">Error al cargar los drivers.</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Drivers</h1>
              <p className="text-muted-foreground mt-2">Gestiona tus conductores</p>
            </div>
            {hasPermission('drivers', 'create') && (
              <Link href="/drivers/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Driver
                </Button>
              </Link>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={drivers}
                searchKey="user"
                searchPlaceholder="Buscar drivers..."
                searchValue={filters.search}
                onSearchChange={(value) => setFilters({ ...filters, search: value, page: 1 })}
                pageSize={filters.limit || 10}
                totalCount={totalCount}
                currentPage={filters.page || 1}
                onPageChange={(page) => setFilters({ ...filters, page })}
                isLoading={isLoading}
                emptyStateTitle="No hay drivers"
                emptyStateDescription="No se encontraron drivers. Crea tu primer driver para comenzar."
              />
            </CardContent>
          </Card>
        </div>
      )}
    </RoleGuard>
  );
}
