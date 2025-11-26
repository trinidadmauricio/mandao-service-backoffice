'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useUsers, useDeleteUser, type UsersFilters } from '@/lib/hooks/use-users';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleBadge } from '@/components/users/role-badge';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
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
import type { User } from '@/types/api';

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<UsersFilters>({
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

  const { data: usersResponse, isLoading, error } = useUsers(filters);
  const deleteUser = useDeleteUser();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();

  const users = usersResponse?.data || [];
  const totalCount = usersResponse?.total;

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteUser.mutateAsync(id);
      toast({
        title: 'Usuario eliminado',
        description: 'El usuario ha sido eliminado exitosamente.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el usuario. Por favor, intenta nuevamente.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [deleteUser, toast]);

  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Usuario',
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div>
              <p className="font-medium">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.phone && (
                <p className="text-xs text-muted-foreground">{user.phone}</p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'role',
        header: 'Rol',
        cell: ({ row }) => {
          return <RoleBadge role={row.original.role} />;
        },
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => {
          const status = row.original.status || (row.original.active ? 'ACTIVE' : 'INACTIVE');
          const statusMap = {
            ACTIVE: { label: 'Activo', variant: 'default' as const },
            INACTIVE: { label: 'Inactivo', variant: 'secondary' as const },
            SUSPENDED: { label: 'Suspendido', variant: 'destructive' as const },
          };
          const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.INACTIVE;
          return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
        },
      },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center space-x-2">
              {hasPermission('users', 'update') && (
                <Link href={`/users/${user.id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </Link>
              )}
              {hasPermission('users', 'delete') && (
                <ConfirmDialog
                  trigger={
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleteUser.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  }
                  title="Eliminar Usuario"
                  description={`¿Estás seguro de que quieres eliminar el usuario "${user.first_name} ${user.last_name}"? Esta acción no se puede deshacer.`}
                  confirmLabel="Eliminar"
                  cancelLabel="Cancelar"
                  variant="destructive"
                  onConfirm={() => handleDelete(user.id)}
                />
              )}
            </div>
          );
        },
      },
    ],
    [hasPermission, deleteUser.isPending, handleDelete]
  );

  if (error) {
    return (
      <PermissionGuard
        resource="users"
        action="read"
        fallback={<div>No tienes permisos para acceder a esta página</div>}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">Error al cargar los usuarios.</p>
            </CardContent>
          </Card>
        </div>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard
      resource="users"
      action="read"
      fallback={<div>No tienes permisos para acceder a esta página</div>}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Usuarios</h1>
            <p className="text-muted-foreground mt-2">Gestiona los usuarios del sistema</p>
          </div>
          {hasPermission('users', 'create') && (
            <Link href="/users/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </Link>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Usuarios</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, email o teléfono..."
                    className="pl-8 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                  value={filters.role || 'all'}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      role:
                        value === 'all'
                          ? undefined
                          : (value as UsersFilters['role']),
                      page: 1,
                    })
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="OWNER">Propietario</SelectItem>
                    <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                    <SelectItem value="MERCHANT_USER">Usuario del Comercio</SelectItem>
                    <SelectItem value="LOGISTICS_PROVIDER">Proveedor Logístico</SelectItem>
                    <SelectItem value="CUSTOMER">Cliente</SelectItem>
                    <SelectItem value="SAAS_ADMIN">Administrador SAAS</SelectItem>
                    <SelectItem value="SAAS_EDITOR">Editor SAAS</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      status:
                        value === 'all'
                          ? undefined
                          : (value as UsersFilters['status']),
                      page: 1,
                    })
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ACTIVE">Activo</SelectItem>
                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                    <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={users}
              pageSize={filters.limit || 10}
              totalCount={totalCount}
              currentPage={filters.page || 1}
              onPageChange={(page) => setFilters({ ...filters, page })}
              isLoading={isLoading}
              emptyStateTitle="No hay usuarios"
              emptyStateDescription="No se encontraron usuarios. Crea tu primer usuario para comenzar."
            />
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}
