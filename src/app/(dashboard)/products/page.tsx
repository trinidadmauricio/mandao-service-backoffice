'use client';

import { useState, useMemo, useCallback } from 'react';
import { useProducts, useDeleteProduct, type ProductsFilters } from '@/lib/hooks/use-products';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/use-toast';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/types/api';

export default function ProductsPage() {
  const [filters, setFilters] = useState<ProductsFilters>({
    page: 1,
    limit: 10,
    search: '',
  });
  const { data: productsResponse, isLoading, error } = useProducts(filters);
  const deleteProduct = useDeleteProduct();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();

  const products = productsResponse?.data || [];
  const totalCount = productsResponse?.total;

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteProduct.mutateAsync(id);
      toast({
        title: 'Producto eliminado',
        description: 'El producto ha sido eliminado exitosamente.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el producto. Por favor, intenta nuevamente.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [deleteProduct, toast]);

  const columns: ColumnDef<Product>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Nombre',
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div>
              <p className="font-medium">{product.name}</p>
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
              )}
              {product.sku && (
                <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'is_active',
        header: 'Estado',
        cell: ({ row }) => {
          const isActive = row.original.is_active ?? row.original.status === 'active';
          return (
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'selling_price',
        header: 'Precio',
        cell: ({ row }) => {
          const price = row.original.selling_price;
          const currency = row.original.currency || 'USD';
          return price ? `${currency} ${price.toFixed(2)}` : 'N/A';
        },
      },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="flex items-center space-x-2">
              {hasPermission('products', 'update') && (
                <Link href={`/products/${product.id}`}>
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
                      disabled={deleteProduct.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  }
                  title="Eliminar Producto"
                  description={`¿Estás seguro de que quieres eliminar el producto "${product.name}"? Esta acción no se puede deshacer.`}
                  confirmLabel="Eliminar"
                  cancelLabel="Cancelar"
                  variant="destructive"
                  onConfirm={() => handleDelete(product.id)}
                />
              )}
            </div>
          );
        },
      },
    ],
    [hasPermission, deleteProduct.isPending, handleDelete]
  );

  if (error) {
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
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">Error al cargar los productos.</p>
            </CardContent>
          </Card>
        </div>
      </PermissionGuard>
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
            <h1 className="text-3xl font-bold">Productos</h1>
            <p className="text-muted-foreground mt-2">Gestiona tu catálogo de productos</p>
          </div>
          {hasPermission('products', 'create') && (
            <Link href="/products/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </Link>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={products}
              searchKey="name"
              searchPlaceholder="Buscar productos..."
              searchValue={filters.search}
              onSearchChange={(value) => setFilters({ ...filters, search: value, page: 1 })}
              pageSize={filters.limit || 10}
              totalCount={totalCount}
              currentPage={filters.page || 1}
              onPageChange={(page) => setFilters({ ...filters, page })}
              isLoading={isLoading}
              emptyStateTitle="No hay productos"
              emptyStateDescription="No se encontraron productos. Crea tu primer producto para comenzar."
            />
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}
