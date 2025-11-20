# Tareas - Sistema de Roles y Permisos - Backoffice

## Fase 1: Constantes

- [ ] **frontend-1:** Actualizar roles y permisos en src/lib/constants/roles.ts (agregar LOGISTICS_PROVIDER, eliminar CUSTOMER del backoffice)
- [ ] **frontend-2:** Crear hook useTenant para obtener información del tenant

## Fase 2: Hooks

- [ ] **frontend-3:** Mejorar hook usePermissions con validación de tenant type y logistics provider
- [ ] **frontend-4:** Crear hook useLogisticsProvider para obtener y validar logistics_provider_id

## Fase 3: Componentes

- [ ] **frontend-5:** Crear o mejorar componente PermissionGuard estándar reutilizable

## Fase 4: Sidebar

- [ ] **frontend-6:** Actualizar Sidebar para aplicar permisos y considerar tenant type
  - [ ] Aplicar permisos a todos los items del menú
  - [ ] Ocultar items según tenant type
  - [ ] Considerar logistics provider para LOGISTICS_PROVIDER

## Fase 5: Páginas - Retail

- [ ] **frontend-7:** Aplicar permisos en páginas de orders
  - [ ] orders/page.tsx (lista)
  - [ ] orders/[id]/page.tsx (detalle)
  - [ ] orders/new/on-demand/page.tsx
  - [ ] orders/new/retail/page.tsx
- [ ] **frontend-7b:** Aplicar permisos en páginas de products
  - [ ] products/page.tsx (lista)
  - [ ] products/[id]/page.tsx (detalle)
  - [ ] products/new/page.tsx
  - [ ] products/[id]/edit/page.tsx
- [ ] **frontend-7c:** Aplicar permisos en páginas de categories
  - [ ] categories/page.tsx
  - [ ] categories/new/page.tsx
  - [ ] categories/[id]/edit/page.tsx
- [ ] **frontend-7d:** Aplicar permisos en páginas de brands
  - [ ] brands/page.tsx
  - [ ] brands/new/page.tsx
  - [ ] brands/[id]/edit/page.tsx

## Fase 6: Páginas - Delivery

- [ ] **frontend-8:** Aplicar permisos en páginas de drivers
  - [ ] drivers/page.tsx (lista)
  - [ ] drivers/[id]/page.tsx (detalle)
  - [ ] drivers/new/page.tsx
  - [ ] drivers/[id]/edit/page.tsx
  - [ ] Filtrar por logistics_provider_id si es LOGISTICS_PROVIDER
- [ ] **frontend-8b:** Aplicar permisos en páginas de vehicles
  - [ ] vehicles/page.tsx (lista)
  - [ ] vehicles/[id]/page.tsx (detalle)
  - [ ] vehicles/new/page.tsx
  - [ ] vehicles/[id]/edit/page.tsx
  - [ ] Filtrar por logistics_provider_id si es LOGISTICS_PROVIDER
- [ ] **frontend-8c:** Aplicar permisos en páginas de logistics-providers
  - [ ] logistics-providers/page.tsx (lista)
  - [ ] logistics-providers/[id]/page.tsx (detalle)
  - [ ] LOGISTICS_PROVIDER no puede ver otros proveedores

## Fase 7: Páginas - Configuración

- [ ] **frontend-9:** Aplicar permisos en páginas de branches
  - [ ] branches/page.tsx
  - [ ] branches/[id]/page.tsx
  - [ ] branches/new/page.tsx
  - [ ] branches/[id]/edit/page.tsx
- [ ] **frontend-9b:** Aplicar permisos en páginas de delivery-zones
  - [ ] delivery-zones/page.tsx
  - [ ] delivery-zones/new/page.tsx
  - [ ] delivery-zones/[id]/edit/page.tsx
- [ ] **frontend-9c:** Aplicar permisos en páginas de delivery-rates
  - [ ] delivery-rates/page.tsx
  - [ ] delivery-rates/new/page.tsx
  - [ ] delivery-rates/[id]/edit/page.tsx
- [ ] **frontend-9d:** Aplicar permisos en páginas de users
  - [ ] users/page.tsx (lista)
  - [ ] users/[id]/page.tsx (detalle)
  - [ ] users/new/page.tsx
  - [ ] users/[id]/edit/page.tsx
  - [ ] LOGISTICS_PROVIDER solo ve usuarios de su proveedor
- [ ] **frontend-9e:** Aplicar permisos en páginas de reports, payments, subscriptions, order-counters, settings
  - [ ] reports/page.tsx
  - [ ] payments/transactions/page.tsx
  - [ ] subscriptions/page.tsx
  - [ ] order-counters/page.tsx
  - [ ] settings/page.tsx

## Fase 8: Validaciones y UX

- [ ] **frontend-10:** Validar tenant type en formularios
  - [ ] Formulario crear orden on-demand (validar ON_DEMAND o HYBRID)
  - [ ] Formulario crear orden retail (validar RETAIL o HYBRID)
  - [ ] Formulario crear producto (validar RETAIL o HYBRID)
  - [ ] Deshabilitar formularios si tenant type no permite
- [ ] **frontend-11:** Mejorar UX con mensajes claros
  - [ ] Mensajes cuando usuario no tiene permiso
  - [ ] Mensajes cuando tenant type no permite operación
  - [ ] Mensajes cuando LOGISTICS_PROVIDER intenta acceder a recurso fuera de su proveedor
  - [ ] Prevenir acciones no permitidas (deshabilitar botones)

## Criterios de Aceptación

- [ ] Roles y permisos definidos (consistente con backend)
- [ ] Hook useTenant funcionando
- [ ] Hook usePermissions mejorado
- [ ] Hook useLogisticsProvider funcionando
- [ ] Componente PermissionGuard funcionando
- [ ] Sidebar respeta permisos y tenant type
- [ ] Todas las páginas protegidas
- [ ] Validaciones de tenant type en formularios
- [ ] Mensajes claros cuando operaciones no están disponibles
- [ ] CUSTOMER no tiene acceso al backoffice
- [ ] LOGISTICS_PROVIDER solo ve sus recursos

