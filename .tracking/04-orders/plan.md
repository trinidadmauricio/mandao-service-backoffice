# Sub-Plan 04: Gestión de Órdenes

## Objetivo
Implementar el módulo completo de gestión de órdenes con todos los endpoints disponibles, respetando el patrón inmutable.

## Alcance
- Listado de órdenes con filtros
- Crear orden on-demand
- Crear orden retail
- Detalle de orden con historial completo
- Asignar/cambiar driver
- Cambiar branch
- Modificar items
- Actualizar estado
- Cancelar orden
- Recalcular totales
- Delivery proof
- Rating
- Tracking público

## Endpoints a Usar
- `GET /api/v1/orders?status=...`
- `POST /api/v1/orders` (on-demand)
- `POST /api/v1/orders/retail`
- `GET /api/v1/orders/{id}`
- `PATCH /api/v1/orders/{id}` (actualizar estado)
- `POST /api/v1/orders/{id}/assign-driver`
- `POST /api/v1/orders/{id}/change-branch`
- `POST /api/v1/orders/{id}/modify-items`
- `POST /api/v1/orders/{id}/cancel`
- `POST /api/v1/orders/{id}/recalculate-totals`
- `POST /api/v1/orders/{id}/delivery-proof`
- `POST /api/v1/orders/{id}/rating`
- `GET /api/public/orders/{trackingCode}`

## Componentes a Crear
- OrdersListPage (tabla con TanStack Table)
- CreateOrderOnDemandForm (formulario multi-step)
- CreateOrderRetailForm (selector de productos)
- OrderDetailPage (vista completa con timeline)
- AssignDriverDialog
- ChangeBranchDialog
- ModifyItemsDialog
- OrderStatusBadge
- OrderTimeline (historial inmutable)
- DeliveryProofForm
- OrderRatingForm
- PublicTrackingPage

## Restricciones por Rol
- OWNER, SUPERVISOR: Acceso completo
- MERCHANT_USER: Solo crear, ver y actualizar estado básico
- CUSTOMER: Solo ver tracking público y agregar rating

## Criterios de Aceptación
- [ ] Listado de órdenes funcionando con filtros
- [ ] Crear orden on-demand funcionando
- [ ] Crear orden retail funcionando
- [ ] Detalle de orden mostrando historial completo
- [ ] Todas las acciones funcionando (asignar driver, cambiar branch, etc.)
- [ ] Respetar patrón inmutable en UI
- [ ] Tests unitarios para componentes principales

