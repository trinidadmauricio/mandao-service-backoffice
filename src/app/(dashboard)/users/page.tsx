'use client';

import { useState, useMemo, useCallback } from 'react';
import { useUsers, useDeleteUser, type UsersFilters } from '@/lib/hooks/use-users';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleBadge } from '@/components/users/role-badge';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/use-toast';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { usePermissions } from '@/lib/hooks/use-permissions';
import type { User } from '@/types/api';

export default function UsersPage() {
  const [filters, setFilters] = useState<UsersFilters>({
    page: 1,
    limit: 10,
    search: '',
  });
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
            <CardTitle>Lista de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={users}
              searchKey="email"
              searchPlaceholder="Buscar usuarios..."
              searchValue={filters.search}
              onSearchChange={(value) => setFilters({ ...filters, search: value, page: 1 })}
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
