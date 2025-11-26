'use client';

import { useCategories, useDeleteCategory } from '@/lib/hooks/use-categories';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';

export default function CategoriesPage() {
  const { data: categories, isLoading, error } = useCategories();
  const deleteCategory = useDeleteCategory();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id);
      toast({
        title: 'Categoría eliminada',
        description: 'La categoría ha sido eliminada exitosamente.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar la categoría. Por favor, intenta nuevamente.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">Error al cargar las categorías.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PermissionGuard
      resource="products"
      action="read"
      allowedTenantTypes={['RETAIL']}
      fallback={
        <div className="py-6">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-2">Acceso Restringido</h2>
            <p className="text-muted-foreground">
              Esta funcionalidad solo está disponible para tenants de tipo RETAIL.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Categorías</h1>
            <p className="text-muted-foreground mt-2">Gestiona las categorías de productos</p>
          </div>
          {hasPermission('products', 'create') && (
            <Link href="/categories/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Categoría
              </Button>
            </Link>
          )}
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          {categories && categories.length > 0 ? (
            <div className="space-y-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{category.name}</p>
                    {category.description && (
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    )}
                    {category.parent_id && (
                      <p className="text-xs text-muted-foreground">Categoría padre: {category.parent_id}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {hasPermission('products', 'update') && (
                      <Link href={`/categories/${category.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      </Link>
                    )}
                    {hasPermission('products', 'delete') && (
                      <ConfirmDialog
                        trigger={
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deleteCategory.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </Button>
                        }
                        title="Eliminar Categoría"
                        description={`¿Estás seguro de que quieres eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`}
                        confirmLabel="Eliminar"
                        cancelLabel="Cancelar"
                        variant="destructive"
                        onConfirm={() => handleDelete(category.id)}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No hay categorías registradas</p>
          )}
        </CardContent>
      </Card>
    </div>
    </PermissionGuard>
  );
}

