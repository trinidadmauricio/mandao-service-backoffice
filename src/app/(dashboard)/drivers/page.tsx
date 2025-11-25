'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useDrivers, useDeleteDriver, type DriversFilters } from '@/lib/hooks/use-drivers';
import { RoleGuard } from '@/components/auth/role-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Trash2, Edit, Search } from 'lucide-react';
import Link from 'next/link';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { useDebounce } from '@/lib/hooks/use-debounce';
import type { Driver } from '@/types/api';

export default function DriversPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<DriversFilters>({
    page: 1,
    limit: 10,
    search: '',
  });

  // Debounce search term
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Update filters when debounced search changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: debouncedSearch || undefined,
      page: 1, // Reset to first page when search changes
    }));
  }, [debouncedSearch]);

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
              <div className="flex items-center justify-between">
                <CardTitle>Lista de Drivers</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre, email o licencia..."
                      className="pl-8 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select
                    value={filters.availability_status || 'all'}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        availability_status:
                          value === 'all'
                            ? undefined
                            : (value as DriversFilters['availability_status']),
                        page: 1,
                      })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="AVAILABLE">Disponible</SelectItem>
                      <SelectItem value="BUSY">Ocupado</SelectItem>
                      <SelectItem value="OFFLINE">Desconectado</SelectItem>
                      <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.work_type || 'all'}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        work_type:
                          value === 'all'
                            ? undefined
                            : (value as DriversFilters['work_type']),
                        page: 1,
                      })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="FULL_TIME">Tiempo Completo</SelectItem>
                      <SelectItem value="PART_TIME">Medio Tiempo</SelectItem>
                      <SelectItem value="FREELANCE">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={drivers}
                searchKey="user"
                searchPlaceholder="Buscar drivers..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
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
