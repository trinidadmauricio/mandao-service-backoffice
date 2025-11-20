# Sub-Plan 03: Retail - Productos

## Objetivo
Implementar el CRUD completo de productos, variants, categorías y marcas para el módulo retail.

## Alcance
- CRUD completo de productos (GET/POST/PATCH/DELETE /api/v1/products)
- CRUD completo de variants (GET/POST/PATCH/DELETE /api/v1/product-variants)
- CRUD de categorías (GET/POST/PATCH/DELETE /api/v1/categories)
- CRUD de marcas (GET/POST/PATCH/DELETE /api/v1/brands)
- Gestión de imágenes
- Gestión de stock por variant y branch

## Endpoints a Usar
- `/api/v1/products` (listar, crear, actualizar, eliminar)
- `/api/v1/product-variants` (listar, crear, actualizar, eliminar)
- `/api/v1/categories` (listar, crear, actualizar, eliminar)
- `/api/v1/brands` (listar, crear, actualizar, eliminar)

## Componentes a Crear
- ProductsListPage (tabla con filtros)
- ProductForm (formulario completo con variants)
- ProductVariantForm
- ProductImageUpload
- StockManager (gestión de stock por branch)
- CategoriesListPage
- CategoryForm
- BrandsListPage
- BrandForm

## Restricciones por Rol
- OWNER, SUPERVISOR: CRUD completo
- MERCHANT_USER: Solo ver y editar (sin eliminar)
- CUSTOMER: Solo lectura (si aplica)

## Criterios de Aceptación
- [ ] CRUD completo de productos funcionando
- [ ] CRUD completo de variants funcionando
- [ ] CRUD de categorías y marcas funcionando
- [ ] Gestión de imágenes implementada
- [ ] Gestión de stock implementada
- [ ] Tests unitarios para componentes principales

