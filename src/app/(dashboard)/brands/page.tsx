'use client';

import { useBrands, useDeleteBrand } from '@/lib/hooks/use-brands';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';

export default function BrandsPage() {
  const { data: brands, isLoading, error } = useBrands();
  const deleteBrand = useDeleteBrand();
  const { hasPermission } = usePermissions();

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta marca?')) {
      try {
        await deleteBrand.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting brand:', error);
      }
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
      allowedTenantTypes={['RETAIL', 'HYBRID']}
      fallback={
        <div className="py-6">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-2">Acceso Restringido</h2>
            <p className="text-muted-foreground">
              Esta funcionalidad solo está disponible para tenants de tipo RETAIL o HYBRID.
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
                      <img
                        src={brand.logo_url}
                        alt={brand.name}
                        className="h-12 w-12 object-contain"
                      />
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
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(brand.id)}
                        disabled={deleteBrand.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
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

