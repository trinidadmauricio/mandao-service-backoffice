'use client';

import { useBrands, useDeleteBrand } from '@/lib/hooks/use-brands';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function BrandsPage() {
  const { data: brands, isLoading, error } = useBrands();
  const deleteBrand = useDeleteBrand();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      await deleteBrand.mutateAsync(id);
      toast({
        title: 'Marca eliminada',
        description: 'La marca ha sido eliminada exitosamente.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar la marca. Por favor, intenta nuevamente.';
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
          <p className="mt-4 text-muted-foreground">Cargando marcas...</p>
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
            <p className="text-destructive">Error al cargar las marcas.</p>
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
            <h1 className="text-3xl font-bold">Marcas</h1>
            <p className="text-muted-foreground mt-2">Gestiona las marcas de productos</p>
          </div>
          {hasPermission('products', 'create') && (
            <Link href="/brands/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Marca
              </Button>
            </Link>
          )}
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Marcas</CardTitle>
        </CardHeader>
        <CardContent>
          {brands && brands.length > 0 ? (
            <div className="space-y-4">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    {brand.logo_url && (
                      <div className="relative h-12 w-12">
                        <Image
                          src={brand.logo_url}
                          alt={brand.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{brand.name}</p>
                      {brand.description && (
                        <p className="text-sm text-muted-foreground">{brand.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {hasPermission('products', 'update') && (
                      <Link href={`/brands/${brand.id}/edit`}>
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
                            disabled={deleteBrand.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </Button>
                        }
                        title="Eliminar Marca"
                        description={`¿Estás seguro de que quieres eliminar la marca "${brand.name}"? Esta acción no se puede deshacer.`}
                        confirmLabel="Eliminar"
                        cancelLabel="Cancelar"
                        variant="destructive"
                        onConfirm={() => handleDelete(brand.id)}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No hay marcas registradas</p>
          )}
        </CardContent>
      </Card>
    </div>
    </PermissionGuard>
  );
}

