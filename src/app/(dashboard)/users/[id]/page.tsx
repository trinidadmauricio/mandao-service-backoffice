"use client";

import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/use-users";
import { useDeleteUser } from "@/lib/hooks/use-users";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/users/role-badge";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Edit, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { formatDate } from "@/lib/utils/date";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { data: user, isLoading, error } = useUser(userId);
  const deleteUser = useDeleteUser();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deleteUser.mutateAsync(userId);
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente.",
      });
      router.push("/users");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al eliminar el usuario. Por favor, intenta nuevamente.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando usuario...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">
              Error al cargar el usuario o usuario no encontrado.
            </p>
            <Link href="/users">
              <Button variant="outline" className="mt-4">
                Volver a Usuarios
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
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
          <div className="flex items-center space-x-4">
            <Link href="/users">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-muted-foreground mt-2">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {hasPermission("users", "update") && (
              <Link href={`/users/${user.id}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </Link>
            )}
            {hasPermission("users", "delete") && user && (
              <ConfirmDialog
                trigger={
                  <Button variant="destructive" disabled={deleteUser.isPending}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                }
                title="Eliminar Usuario"
                description={`¿Estás seguro de que quieres eliminar el usuario "${user.first_name} ${user.last_name}"? Esta acción no se puede deshacer.`}
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
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre Completo</p>
                <p className="font-medium">
                  {user.first_name} {user.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              {user.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Rol</p>
                <div className="mt-1">
                  <RoleBadge role={user.role} />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <div className="mt-1">
                  <Badge variant={user.active ? "default" : "secondary"}>
                    {user.active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Email Verificado
                </p>
                <div className="mt-1">
                  <Badge variant={user.email_verified ? "default" : "outline"}>
                    {user.email_verified ? "Verificado" : "No Verificado"}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Fecha de Creación
                </p>
                <p className="font-medium">{user.created_at ? formatDate(user.created_at) : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Última Actualización
                </p>
                <p className="font-medium">{user.updated_at ? formatDate(user.updated_at) : 'N/A'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PermissionGuard>
  );
}
