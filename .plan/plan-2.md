# Plan Completo Backoffice - Mandao Service

## Análisis del Swagger - Endpoints Disponibles

### Módulos Disponibles en API

- ✅ **Auth**: login, register, verify-email, password reset
- ✅ **Tenants**: CRUD completo
- ✅ **Users**: CRUD completo
- ✅ **Branches**: CRUD completo
- ✅ **Products**: CRUD completo
- ✅ **Product Variants**: CRUD completo
- ✅ **Categories**: CRUD completo
- ✅ **Brands**: CRUD completo
- ✅ **Storefront**: productos públicos, checkout
- ✅ **Orders**: ✅ **COMPLETO** - listar, crear on-demand, crear retail, detalle, actualizar estado, asignar driver, cambiar branch, modificar items, cancelar, recalcular totales, delivery proof, rating
- ✅ **Drivers**: CRUD completo
- ✅ **Vehicles**: CRUD completo
- ✅ **Delivery Zones**: CRUD completo
- ✅ **Delivery Rates**: CRUD completo
- ✅ **Logistics Providers**: CRUD completo
- ✅ **Payments**: checkout, transacciones, refunds, webhooks
- ✅ **Reports**: órdenes, inventario, drivers, dashboard KPIs
- ✅ **Subscriptions**: change-plan, start-trial, convert-trial, limits
- ✅ **Subscription Plans**: CRUD completo
- ✅ **Order Counters**: CRUD completo, increment

### Módulos NO incluidos en Backoffice

- ❌ **OAuth**: Flows de OAuth2 (solo para integraciones externas, no backoffice)
- ❌ **OAuth Clients**: Gestión de clientes OAuth2 (no necesario en backoffice)

## Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **Data Fetching**: React Query (TanStack Query)
- **HTTP Client**: Axios con interceptors
- **Charts**: Recharts
- **Tables**: TanStack Table (React Table)
- **i18n**: next-i18next
- **Currency**: currency.js

## Estructura del Proyecto

```
mandao-service-backoffice/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Rutas de autenticación
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── verify-email/
│   │   ├── (dashboard)/       # Rutas protegidas
│   │   │   ├── layout.tsx      # Layout con sidebar y role guards
│   │   │   ├── page.tsx       # Dashboard principal
│   │   │   ├── orders/        # Gestión de órdenes
│   │   │   ├── products/      # Catálogo de productos
│   │   │   ├── drivers/       # Gestión de drivers
│   │   │   ├── vehicles/      # Gestión de vehículos
│   │   │   ├── branches/      # Gestión de sucursales
│   │   │   ├── delivery/      # Configuración de delivery
│   │   │   ├── payments/       # Gestión de pagos
│   │   │   ├── reports/       # Reportes y analytics
│   │   │   ├── subscriptions/ # Suscripciones
│   │   │   ├── settings/      # Configuración (solo OWNER)
│   │   │   └── users/         # Gestión de usuarios (solo OWNER/SUPERVISOR)
│   │   └── api/               # API routes (proxies si necesario)
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── layout/             # Header, Sidebar, Footer
│   │   ├── auth/               # RoleGuard, usePermissions
│   │   ├── forms/              # Formularios reutilizables
│   │   ├── tables/             # Tablas con TanStack Table
│   │   ├── charts/             # Gráficos con Recharts
│   │   └── features/           # Componentes por feature
│   ├── lib/
│   │   ├── api/               # Cliente Axios configurado
│   │   │   ├── client.ts      # Instancia de Axios
│   │   │   ├── interceptors.ts # JWT, refresh token, tenant
│   │   │   └── endpoints.ts   # Tipos y funciones de endpoints
│   │   ├── hooks/             # Custom hooks
│   │   │   ├── use-auth.ts
│   │   │   ├── use-tenant.ts
│   │   │   ├── use-permissions.ts
│   │   │   └── use-api.ts
│   │   ├── utils/             # Utilidades
│   │   │   ├── currency.ts
│   │   │   ├── date.ts
│   │   │   └── validation.ts
│   │   └── constants/         # Constantes
│   │       └── roles.ts       # Definición de roles y permisos
│   ├── types/                 # TypeScript types
│   │   ├── api.ts             # Tipos de respuestas API
│   │   └── entities.ts        # Tipos de entidades
│   └── i18n/                  # Traducciones
│       ├── es/
│       └── en/
├── public/
└── package.json
```

## Sistema de Roles y Permisos

### Roles Disponibles

- **OWNER**: Propietario del tenant, acceso total
- **SUPERVISOR**: Supervisor operativo, acceso a operaciones y reportes
- **MERCHANT_USER**: Usuario del merchant, acceso limitado a operaciones básicas
- **CUSTOMER**: Cliente final, solo lectura de sus órdenes (si aplica)

### Matriz de Permisos por Módulo

| Módulo | OWNER | SUPERVISOR | MERCHANT_USER | CUSTOMER |

|--------|-------|------------|---------------|----------|

| Dashboard | ✅ | ✅ | ✅ | ❌ |

| Órdenes (ver) | ✅ | ✅ | ✅ | Solo propias |

| Órdenes (crear) | ✅ | ✅ | ✅ | ❌ |

| Órdenes (asignar driver) | ✅ | ✅ | ❌ | ❌ |

| Órdenes (cancelar) | ✅ | ✅ | ❌ | ❌ |

| Órdenes (recalcular) | ✅ | ✅ | ❌ | ❌ |

| Productos (CRUD) | ✅ | ✅ | Ver/Editar | ❌ |

| Drivers (CRUD) | ✅ | ✅ | ❌ | ❌ |

| Vehículos (CRUD) | ✅ | ✅ | ❌ | ❌ |

| Branches (CRUD) | ✅ | ✅ | ❌ | ❌ |

| Delivery Zones/Rates | ✅ | ✅ | ❌ | ❌ |

| Payments (ver) | ✅ | ✅ | ❌ | ❌ |

| Payments (refund) | ✅ | ✅ | ❌ | ❌ |

| Reportes | ✅ | ✅ | Básicos | ❌ |

| Suscripciones | ✅ | Ver | Ver | ❌ |

| Configuración Tenant | ✅ | ❌ | ❌ | ❌ |

| Usuarios (CRUD) | ✅ | Ver/Editar | ❌ | ❌ |

| Order Counters | ✅ | Ver | ❌ | ❌ |

| Logistics Providers | ✅ | ✅ | ❌ | ❌ |

## Módulos a Implementar

### 1. Autenticación y Autorización

**Endpoints disponibles:**

- `POST /api/v1/auth/login` (genera JWT access token)
- `POST /api/v1/auth/register`
- `GET /api/v1/auth/verify-email`
- `POST /api/v1/auth/password/reset-request`
- `POST /api/v1/auth/password/reset`

**Funcionalidades:**

- Login con email/password (genera JWT access token)
- Registro de nuevos usuarios
- Verificación de email
- Recuperación de contraseña
- Gestión de sesión con JWT (almacenado en httpOnly cookies)
- Middleware de autenticación para rutas protegidas
- **Sistema de roles y permisos:**
  - Extraer rol del JWT después del login
  - `RoleGuard` component para proteger rutas
  - `usePermissions` hook para verificar permisos
  - Ocultar/mostrar elementos UI según rol

**Componentes:**

- `LoginForm` (shadcn/ui: form, input, button, card)
- `RegisterForm`
- `VerifyEmailPage`
- `ForgotPasswordForm`
- `ResetPasswordForm`
- `RoleGuard` (componente para proteger rutas por rol)
- `usePermissions` (hook para verificar permisos)
- `ProtectedRoute` (wrapper para rutas protegidas)

**Reglas del Proyecto:**

- Validar con Zod antes de enviar
- Manejar errores con mensajes traducibles (i18n)
- No loggear tokens o passwords
- Usar TypeScript estricto (no `any`)

### 2. Dashboard Principal

**Endpoints disponibles:**

- `GET /api/v1/reports/dashboard/kpis?period=today|week|month|year`

**Funcionalidades:**

- KPIs en tiempo real:
  - Total de órdenes
  - Revenue total
  - Valor promedio de orden
  - Drivers activos
- Gráficos:
  - Órdenes por período (línea)
  - Revenue por período (área)
  - Distribución de estados de órdenes (pie)
  - Top productos vendidos (bar)

**Restricciones por Rol:**

- Todos los roles pueden ver dashboard (excepto CUSTOMER)

**Componentes:**

- `DashboardPage` (layout con grid)
- `KPICard` (shadcn/ui: card)
- `OrdersChart` (Recharts: LineChart)
- `RevenueChart` (Recharts: AreaChart)
- `StatusDistributionChart` (Recharts: PieChart)
- `TopProductsChart` (Recharts: BarChart)

### 3. Gestión de Órdenes ✅

**Endpoints disponibles:**

- `GET /api/v1/orders?status=DRAFT|PENDING|CONFIRMED|ASSIGNED|IN_TRANSIT|DELIVERED|CANCELLED|FAILED`
- `POST /api/v1/orders` (crear orden on-demand)
- `POST /api/v1/orders/retail` (crear orden retail)
- `GET /api/v1/orders/{id}` (detalle completo)
- `PATCH /api/v1/orders/{id}` (actualizar estado con validación de transiciones)
- `POST /api/v1/orders/{id}/assign-driver` (asignar driver - patrón inmutable)
- `POST /api/v1/orders/{id}/change-branch` (cambiar branch - patrón inmutable)
- `POST /api/v1/orders/{id}/modify-items` (modificar items - patrón inmutable)
- `POST /api/v1/orders/{id}/cancel` (cancelar orden con razón)
- `POST /api/v1/orders/{id}/recalculate-totals` (recalcular totales - patrón inmutable)
- `POST /api/v1/orders/{id}/delivery-proof` (agregar prueba de entrega: SIGNATURE, PHOTO, CODE, NONE)
- `POST /api/v1/orders/{id}/rating` (agregar calificación de entrega)
- `GET /api/public/orders/{trackingCode}` (tracking público - sin autenticación)

**Funcionalidades:**

- Listado de órdenes con filtros (estado, fecha, driver, branch, tipo)
- Crear orden on-demand (formulario completo con customer_snapshot, delivery_address, items, pickup_address opcional)
- Crear orden retail (selección de productos del catálogo con product_id/variant_id, validación de stock)
- Detalle de orden con historial completo (inmutabilidad - ver todos los cambios)
- Asignar/cambiar driver (sigue patrón inmutable, INSERT nuevo order_drivers)
- Cambiar branch (sigue patrón inmutable, INSERT nuevo order_branches)
- Modificar items (sigue patrón inmutable, INSERT todos los items de nueva versión)
- Actualizar estado manualmente (con validación de transiciones usando OrderStateMachine)
- Cancelar orden (con razón de cancelación opcional)
- Recalcular totales (con tax_rate y discount_amount opcionales)
- Agregar prueba de entrega (SIGNATURE, PHOTO, CODE, NONE)
- Agregar rating (customer_rating, driver_rating, comentarios)
- Ver tracking público (sin autenticación)

**Restricciones por Rol:**

- **OWNER, SUPERVISOR**: Acceso completo a todas las funcionalidades
- **MERCHANT_USER**: Solo crear, ver y actualizar estado básico (sin cancelar, sin recalcular totales, sin asignar driver)
- **CUSTOMER**: Solo ver tracking público y agregar rating

**Componentes:**

- `OrdersListPage` (tabla con TanStack Table, filtros por estado)
- `CreateOrderOnDemandForm` (formulario multi-step con validación Zod)
- `CreateOrderRetailForm` (selector de productos con validación de stock)
- `OrderDetailPage` (vista completa con timeline de cambios, historial inmutable)
- `AssignDriverDialog` (shadcn/ui: dialog con lista de drivers disponibles)
- `ChangeBranchDialog` (shadcn/ui: dialog con lista de branches)
- `ModifyItemsDialog` (formulario para modificar items)
- `OrderStatusBadge` (shadcn/ui: badge con colores por estado)
- `OrderTimeline` (componente custom mostrando historial inmutable)
- `DeliveryProofForm` (formulario para agregar prueba de entrega)
- `OrderRatingForm` (formulario para calificar entrega)
- `PublicTrackingPage` (página pública para tracking sin autenticación)

**Reglas del Proyecto:**

- Respetar inmutabilidad: nunca UPDATE/DELETE, solo INSERT nuevos registros
- Validar transiciones de estado con OrderStateMachine
- Validar datos con Zod antes de enviar
- Mostrar historial completo de cambios (auditoría)

### 4. Gestión de Productos (Retail)

**Endpoints disponibles:**

- `GET /api/v1/products` (listar con filtros)
- `POST /api/v1/products` (crear)
- `GET /api/v1/products/{id}` (detalle)
- `PATCH /api/v1/products/{id}` (actualizar)
- `DELETE /api/v1/products/{id}` (eliminar)
- `GET /api/v1/product-variants` (listar variants)
- `POST /api/v1/product-variants` (crear variant)
- `GET /api/v1/product-variants/{id}` (detalle variant)
- `PATCH /api/v1/product-variants/{id}` (actualizar variant)
- `DELETE /api/v1/product-variants/{id}` (eliminar variant)

**Funcionalidades:**

- CRUD completo de productos
- Gestión de variants (tallas, colores, etc.)
- Gestión de imágenes
- Gestión de precios y stock por variant
- Gestión de categorías y marcas
- Estados: active, inactive, draft

**Restricciones por Rol:**

- **OWNER, SUPERVISOR**: CRUD completo
- **MERCHANT_USER**: Solo ver y editar (sin eliminar)
- **CUSTOMER**: Solo lectura (si aplica)

**Componentes:**

- `ProductsListPage` (tabla con filtros)
- `ProductForm` (formulario completo con variants)
- `ProductVariantForm` (formulario de variant)
- `ProductImageUpload` (upload de imágenes)
- `StockManager` (gestión de stock por branch)

### 5. Gestión de Categorías y Marcas

**Endpoints disponibles:**

- `GET /api/v1/categories` (listar)
- `POST /api/v1/categories` (crear)
- `GET /api/v1/categories/{id}` (detalle)
- `PATCH /api/v1/categories/{id}` (actualizar)
- `DELETE /api/v1/categories/{id}` (eliminar)
- `GET /api/v1/brands` (listar)
- `POST /api/v1/brands` (crear)
- `GET /api/v1/brands/{id}` (detalle)
- `PATCH /api/v1/brands/{id}` (actualizar)
- `DELETE /api/v1/brands/{id}` (eliminar)

**Funcionalidades:**

- CRUD de categorías (jerárquicas)
- CRUD de marcas
- Asignación de productos a categorías/marcas

**Componentes:**

- `CategoriesListPage`
- `CategoryForm`
- `BrandsListPage`
- `BrandForm`

### 6. Gestión de Drivers

**Endpoints disponibles:**

- `GET /api/v1/drivers` (listar)
- `POST /api/v1/drivers` (crear)
- `GET /api/v1/drivers/{id}` (detalle)
- `PATCH /api/v1/drivers/{id}` (actualizar)
- `DELETE /api/v1/drivers/{id}` (eliminar)

**Funcionalidades:**

- CRUD completo de drivers
- Estados: active, inactive, busy
- Asignación de vehículos
- Performance y métricas

**Restricciones por Rol:**

- **OWNER, SUPERVISOR**: CRUD completo
- **MERCHANT_USER, CUSTOMER**: Sin acceso

**Componentes:**

- `DriversListPage` (tabla con estado)
- `DriverForm`
- `DriverDetailPage`
- `DriverPerformanceCard`

### 7. Gestión de Vehículos

**Endpoints disponibles:**

- `GET /api/v1/vehicles` (listar)
- `POST /api/v1/vehicles` (crear)
- `GET /api/v1/vehicles/{id}` (detalle)
- `PATCH /api/v1/vehicles/{id}` (actualizar)
- `DELETE /api/v1/vehicles/{id}` (eliminar)

**Funcionalidades:**

- CRUD completo de vehículos
- Tipos: MOTORCYCLE, SEDAN, MINI_VAN, PANEL, TRUCK, PICKUP
- Estados: available, in_use, maintenance
- Asignación a drivers

**Restricciones por Rol:**

- **OWNER, SUPERVISOR**: CRUD completo
- **MERCHANT_USER, CUSTOMER**: Sin acceso

**Componentes:**

- `VehiclesListPage`
- `VehicleForm`
- `VehicleDetailPage`
- `AssignVehicleDialog`

### 8. Gestión de Sucursales (Branches)

**Endpoints disponibles:**

- `GET /api/v1/branches` (listar)
- `POST /api/v1/branches` (crear)
- `GET /api/v1/branches/{id}` (detalle)
- `PATCH /api/v1/branches/{id}` (actualizar)
- `DELETE /api/v1/branches/{id}` (eliminar)

**Funcionalidades:**

- CRUD completo de branches
- Coordenadas (lat/lng) para mapas
- Horarios de operación
- Estados: active, inactive

**Restricciones por Rol:**

- **OWNER, SUPERVISOR**: CRUD completo
- **MERCHANT_USER, CUSTOMER**: Sin acceso

**Componentes:**

- `BranchesListPage`
- `BranchForm` (con mapa para seleccionar ubicación)
- `BranchDetailPage`
- `BranchMap` (integración con Google Maps o similar)

### 9. Configuración de Delivery

**Endpoints disponibles:**

- `GET /api/v1/delivery-zones` (listar)
- `POST /api/v1/delivery-zones` (crear)
- `GET /api/v1/delivery-zones/{id}` (detalle)
- `PATCH /api/v1/delivery-zones/{id}` (actualizar)
- `DELETE /api/v1/delivery-zones/{id}` (eliminar)
- `GET /api/v1/delivery-rates` (listar)
- `POST /api/v1/delivery-rates` (crear)
- `GET /api/v1/delivery-rates/{id}` (detalle)
- `PATCH /api/v1/delivery-rates/{id}` (actualizar)
- `DELETE /api/v1/delivery-rates/{id}` (eliminar)

**Funcionalidades:**

- Gestión de zonas de entrega (polígonos en mapa)
- Gestión de tarifas por zona, distancia, tipo de vehículo
- Multiplicadores de prioridad (NORMAL, EXPRESS, URGENT)

**Restricciones por Rol:**

- **OWNER, SUPERVISOR**: CRUD completo
- **MERCHANT_USER, CUSTOMER**: Sin acceso

**Componentes:**

- `DeliveryZonesListPage`
- `DeliveryZoneForm` (con mapa para dibujar polígonos)
- `DeliveryRatesListPage`
- `DeliveryRateForm` (con calculadora de precios)

### 10. Proveedores Logísticos

**Endpoints disponibles:**

- `GET /api/v1/logistics-providers` (listar)
- `POST /api/v1/logistics-providers` (crear)
- `GET /api/v1/logistics-providers/{id}` (detalle)
- `PATCH /api/v1/logistics-providers/{id}` (actualizar)
- `DELETE /api/v1/logistics-providers/{id}` (eliminar)

**Funcionalidades:**

- CRUD de proveedores logísticos
- Estados de verificación: PENDING, VERIFIED, REJECTED
- Documentos de verificación

**Restricciones por Rol:**

- **OWNER, SUPERVISOR**: CRUD completo
- **MERCHANT_USER, CUSTOMER**: Sin acceso

**Componentes:**

- `LogisticsProvidersListPage`
- `LogisticsProviderForm`
- `VerificationStatusBadge`

### 11. Gestión de Pagos

**Endpoints disponibles:**

- `GET /api/v1/payments/orders/{orderId}/payments` (pagos de orden)
- `POST /api/v1/payments/checkout` (crear checkout)
- `GET /api/v1/payments/transactions` (listar transacciones)
- `POST /api/v1/payments/refunds` (procesar refund)
- `POST /api/v1/payments/webhooks/stripe` (webhook - backend only)

**Funcionalidades:**

- Listado de transacciones con filtros
- Detalle de pagos por orden
- Procesar refunds
- Ver estado de checkout sessions
- Integración con Stripe

**Restricciones por Rol:**

- **OWNER, SUPERVISOR**: Acceso completo
- **MERCHANT_USER, CUSTOMER**: Sin acceso

**Componentes:**

- `PaymentsListPage` (tabla de transacciones)
- `PaymentDetailDialog`
- `RefundDialog`
- `PaymentStatusBadge`

### 12. Reportes y Analytics

**Endpoints disponibles:**

- `GET /api/v1/reports/orders` (reporte de órdenes)
- `GET /api/v1/reports/orders/export` (exportar CSV)
- `GET /api/v1/reports/inventory` (reporte de inventario)
- `GET /api/v1/reports/drivers` (reporte de drivers)
- `GET /api/v1/reports/dashboard/kpis` (KPIs del dashboard)

**Funcionalidades:**

- Reporte de órdenes con filtros avanzados
- Export a CSV
- Reporte de inventario
- Reporte de performance de drivers
- Gráficos interactivos

**Restricciones por Rol:**

- **OWNER, SUPERVISOR**: Todos los reportes
- **MERCHANT_USER**: Solo reportes básicos (órdenes, inventario)
- **CUSTOMER**: Sin acceso

**Componentes:**

- `ReportsPage` (página principal con tabs)
- `OrdersReport` (tabla con filtros y export)
- `InventoryReport`
- `DriversReport`
- `ExportButton` (descargar CSV)

### 13. Suscripciones

**Endpoints disponibles:**

- `GET /api/v1/subscription-plans` (listar planes)
- `POST /api/v1/subscription-plans` (crear plan - admin)
- `GET /api/v1/subscription-plans/{id}` (detalle)
- `PATCH /api/v1/subscription-plans/{id}` (actualizar - admin)
- `DELETE /api/v1/subscription-plans/{id}` (eliminar - admin)
- `POST /api/v1/subscriptions/change-plan` (cambiar plan)
- `POST /api/v1/subscriptions/start-trial` (iniciar trial)
- `POST /api/v1/subscriptions/convert-trial` (convertir trial)
- `GET /api/v1/subscriptions/limits` (límites actuales)

**Funcionalidades:**

- Ver plan actual y límites
- Cambiar de plan (upgrade/downgrade)
- Iniciar período de prueba
- Convertir trial a plan de pago
- Ver uso actual vs límites

**Restricciones por Rol:**

- **OWNER**: Acceso completo (cambiar plan, iniciar trial)
- **SUPERVISOR, MERCHANT_USER**: Solo ver plan y límites
- **CUSTOMER**: Sin acceso

**Componentes:**

- `SubscriptionsPage` (vista de plan actual)
- `ChangePlanDialog` (selector de planes)
- `SubscriptionLimitsCard` (límites y uso)
- `TrialBanner` (si está en trial)

### 14. Gestión de Usuarios

**Endpoints disponibles:**

- `GET /api/v1/users` (listar)
- `POST /api/v1/users` (crear)
- `GET /api/v1/users/{id}` (detalle)
- `PATCH /api/v1/users/{id}` (actualizar)
- `DELETE /api/v1/users/{id}` (eliminar)

**Funcionalidades:**

- CRUD completo de usuarios
- Roles: OWNER, SUPERVISOR, MERCHANT_USER, CUSTOMER
- Activar/desactivar usuarios
- Asignar roles

**Restricciones por Rol:**

- **OWNER**: CRUD completo
- **SUPERVISOR**: Ver y editar (sin eliminar, sin cambiar a OWNER)
- **MERCHANT_USER, CUSTOMER**: Sin acceso

**Componentes:**

- `UsersListPage`
- `UserForm`
- `UserDetailPage`
- `RoleBadge`

### 15. Configuración del Tenant

**Endpoints disponibles:**

- `GET /api/v1/tenants` (listar - admin)
- `POST /api/v1/tenants` (crear - admin)
- `GET /api/v1/tenants/{id}` (detalle)
- `PATCH /api/v1/tenants/{id}` (actualizar)
- `DELETE /api/v1/tenants/{id}` (eliminar - admin)

**Funcionalidades:**

- Ver información del tenant actual
- Actualizar configuración (nombre, logo, currency, locale)
- Configuración de delivery
- Configuración de retail

**Restricciones por Rol:**

- **OWNER**: Acceso completo
- **SUPERVISOR, MERCHANT_USER, CUSTOMER**: Sin acceso

**Componentes:**

- `TenantSettingsPage` (página de configuración)
- `TenantInfoForm`
- `TenantDeliverySettings`
- `TenantRetailSettings`

### 16. Order Counters

**Endpoints disponibles:**

- `GET /api/v1/order-counters/tenant/{tenant_id}` (obtener contador)
- `PATCH /api/v1/order-counters/tenant/{tenant_id}` (actualizar)
- `POST /api/v1/order-counters` (crear)
- `POST /api/v1/order-counters/tenant/{tenant_id}/increment` (incrementar)

**Funcionalidades:**

- Ver contador actual
- Configurar prefijo y padding
- Resetear contador
- Incrementar manualmente (testing)

**Restricciones por Rol:**

- **OWNER**: Acceso completo
- **SUPERVISOR**: Solo ver
- **MERCHANT_USER, CUSTOMER**: Sin acceso

**Componentes:**

- `OrderCountersPage` (configuración)
- `OrderCounterForm`

## Proceso de Seguimiento y Tracking

Cada sub-plan creará una carpeta en `.tracking/` con 3 archivos:

- `plan.md`: Descripción detallada del sub-plan
- `tasks.md`: Lista de tareas con checkboxes para marcar progreso
- `summary.md`: Resumen de avances y decisiones tomadas

**Estructura:**

```
.tracking/
├── 01-fundacion/
│   ├── plan.md
│   ├── tasks.md
│   └── summary.md
├── 02-dashboard-config/
│   ├── plan.md
│   ├── tasks.md
│   └── summary.md
└── ...
```

**Proceso:**

1. Al iniciar un sub-plan, crear la carpeta y los 3 archivos
2. Actualizar `tasks.md` marcando tareas completadas con `[x]`
3. Actualizar `summary.md` con avances, decisiones y blockers
4. Al completar el sub-plan, marcar como completado en `summary.md`

## Implementación por Sub-Planes

### Sub-Plan 01: Fundación (Semana 1-2)

**Carpeta:** `.tracking/01-fundacion/`

**Tareas:**

1. Setup proyecto Next.js 14 + TypeScript
2. Configurar shadcn/ui
3. Setup Tailwind CSS
4. Configurar Axios con interceptors (JWT, refresh token, tenant)
5. Setup React Query
6. Setup i18n (next-i18next)
7. Layout base (Header, Sidebar, Footer)
8. Sistema de autenticación (login, register, middleware)
9. **Sistema de roles y permisos** (RoleGuard, usePermissions, constants/roles.ts)
10. **Tests unitarios** de componentes base y hooks

**Tests a implementar:**

- Tests de `useAuth` hook
- Tests de `usePermissions` hook
- Tests de `RoleGuard` component
- Tests de `LoginForm` component
- Tests de interceptors de Axios

### Fase 2: Dashboard y Configuración (Semana 3)

1. Dashboard con KPIs (`GET /api/v1/reports/dashboard/kpis`)
2. Gráficos con Recharts
3. Configuración de tenant (`GET /api/v1/tenants/{id}`, `PATCH`) - solo OWNER
4. Gestión de usuarios (`GET /api/v1/users`, CRUD) - OWNER/SUPERVISOR

### Fase 3: Retail - Productos (Semana 4-5)

1. CRUD de productos (`/api/v1/products`)
2. CRUD de variants (`/api/v1/product-variants`)
3. CRUD de categorías (`/api/v1/categories`)
4. CRUD de marcas (`/api/v1/brands`)
5. Gestión de imágenes
6. Gestión de stock

### Fase 4: Delivery - Drivers y Vehículos (Semana 6)

1. CRUD de drivers (`/api/v1/drivers`) - OWNER/SUPERVISOR
2. CRUD de vehículos (`/api/v1/vehicles`) - OWNER/SUPERVISOR
3. Asignación de vehículos a drivers
4. Performance de drivers

### Fase 5: Delivery - Configuración (Semana 7)

1. CRUD de branches (`/api/v1/branches`) - OWNER/SUPERVISOR
2. CRUD de delivery zones (`/api/v1/delivery-zones`) - OWNER/SUPERVISOR
3. CRUD de delivery rates (`/api/v1/delivery-rates`) - OWNER/SUPERVISOR
4. Integración con mapas (Google Maps o similar)

### Fase 6: Órdenes (Semana 8)

1. Listado de órdenes (`GET /api/v1/orders`)
2. Crear orden on-demand (`POST /api/v1/orders`)
3. Crear orden retail (`POST /api/v1/orders/retail`)
4. Detalle de orden con historial (`GET /api/v1/orders/{id}`)
5. Asignar driver (`POST /api/v1/orders/{id}/assign-driver`) - OWNER/SUPERVISOR
6. Cambiar branch (`POST /api/v1/orders/{id}/change-branch`) - OWNER/SUPERVISOR
7. Modificar items (`POST /api/v1/orders/{id}/modify-items`) - OWNER/SUPERVISOR
8. Actualizar estado (`PATCH /api/v1/orders/{id}`)
9. Cancelar orden (`POST /api/v1/orders/{id}/cancel`) - OWNER/SUPERVISOR
10. Recalcular totales (`POST /api/v1/orders/{id}/recalculate-totals`) - OWNER/SUPERVISOR
11. Delivery proof (`POST /api/v1/orders/{id}/delivery-proof`)
12. Rating (`POST /api/v1/orders/{id}/rating`)
13. Tracking público (`GET /api/public/orders/{trackingCode}`)

### Fase 7: Pagos y Suscripciones (Semana 9)

1. Listado de transacciones (`/api/v1/payments/transactions`) - OWNER/SUPERVISOR
2. Detalle de pagos por orden
3. Procesar refunds (`POST /api/v1/payments/refunds`) - OWNER/SUPERVISOR
4. Gestión de suscripciones (`/api/v1/subscriptions/*`)
5. Cambiar plan (OWNER)
6. Ver límites y uso

### Fase 8: Reportes (Semana 10)

1. Reporte de órdenes (`/api/v1/reports/orders`)
2. Export a CSV (`/api/v1/reports/orders/export`)
3. Reporte de inventario (`/api/v1/reports/inventory`)
4. Reporte de drivers (`/api/v1/reports/drivers`)
5. Gráficos interactivos

### Fase 9: Funcionalidades Adicionales (Semana 11)

1. Order Counters (`/api/v1/order-counters`) - OWNER/SUPERVISOR
2. Logistics Providers (`/api/v1/logistics-providers`) - OWNER/SUPERVISOR

### Fase 10: Optimización y Testing (Semana 12)

1. Performance optimization
2. Testing (Jest + React Testing Library)
3. Bug fixes
4. Polish UI/UX
5. Documentación

## Consideraciones Técnicas

### Reglas del Proyecto (.cursorrules)

- **TypeScript estricto**: No usar `any`, preferir tipos específicos
- **Validación con Zod**: Todos los formularios validados con Zod
- **Clean Architecture**: Separar concerns (presentation, application, domain)
- **TDD**: Escribir tests antes de implementar (cobertura mínima 80%)
- **SOLID Principles**: Especialmente Single Responsibility y Dependency Inversion
- **Código Limpio**: Funciones pequeñas, nombres descriptivos, evitar duplicación
- **Manejo de Errores**: Mensajes traducibles, códigos HTTP apropiados
- **No loggear información sensible**: Tokens, passwords, etc.

### Multi-Tenancy

- El `tenant_id` viene en el JWT, no se envía explícitamente
- Middleware de Next.js para validar tenant
- Context de React para tenant actual
- Aislamiento completo entre tenants

### Multi-Currency

- Currency almacenado en Tenant (`default_currency`)
- Usar `currency.js` para formatear montos
- Mostrar currency en todas las operaciones monetarias

### Multi-Language

- Locale almacenado en Tenant (`default_locale`)
- Header `Accept-Language` en requests
- Traducciones con `next-i18next`
- Formato de fechas según locale

### Autenticación

- JWT en httpOnly cookies (más seguro que localStorage)
- Refresh token rotation automático (si está disponible)
- Interceptor de Axios para manejar 401
- Redirección a login si token inválido
- **Solo login tradicional**: No OAuth flows en backoffice

### Sistema de Roles

- Roles definidos en `lib/constants/roles.ts`
- `RoleGuard` component para proteger rutas
- `usePermissions` hook para verificar permisos en componentes
- Ocultar/mostrar elementos UI según rol
- Validar permisos en el servidor también (si hay API routes)

### Manejo de Errores

- Error boundary global
- Toasts para errores (shadcn/ui: toast)
- Mensajes de error traducibles
- Logging de errores (sin información sensible)

### Performance

- Code splitting por ruta
- Lazy loading de componentes pesados
- Virtual scrolling en tablas grandes
- Paginación en listados
- Debounce en búsquedas
- Caching con React Query

### Inmutabilidad en Órdenes

- Respetar patrón inmutable: nunca UPDATE/DELETE, solo INSERT
- Mostrar historial completo de cambios
- Validar transiciones de estado con OrderStateMachine
- UI debe reflejar que los cambios generan nuevos registros

## Dependencias Principales

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-table": "^8.0.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "recharts": "^2.10.0",
    "currency.js": "^2.0.4",
    "next-i18next": "^15.0.0",
    "date-fns": "^3.0.0",
    "js-cookie": "^3.0.5"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/js-cookie": "^3.0.5",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0"
  }
}
```

## Notas Importantes

1. **OAuth2 NO en Backoffice**: Los endpoints de OAuth2 (`/oauth/authorize`, `/oauth/token`) son para integraciones externas, NO se implementan en el backoffice.

2. **Solo Login Tradicional**: El backoffice usa únicamente `POST /api/v1/auth/login` que genera un JWT access token.

3. **Sistema de Roles**: Implementar `RoleGuard` y `usePermissions` desde el inicio. Validar permisos en cada ruta y componente.

4. **Reglas del Proyecto**: Siempre seguir las reglas definidas en `.cursorrules`: TypeScript estricto, Zod para validación, TDD, Clean Architecture, SOLID, etc.

5. **Inmutabilidad en Órdenes**: Respetar el patrón inmutable. La UI debe mostrar claramente que los cambios generan nuevos registros (historial completo).

6. **Multi-Tenancy**: Todos los endpoints automáticamente filtran por tenant del usuario autenticado (extraído del JWT).

7. **Validación**: Todos los formularios deben validarse con Zod antes de enviar a la API.

8. **Responsive**: El diseño debe ser responsive (mobile-first) usando Tailwind CSS breakpoints.

9. **Accesibilidad**: Usar componentes de shadcn/ui que ya incluyen ARIA labels y keyboard navigation.

10. **Testing**: Escribir tests antes de implementar (TDD), cobertura mínima 80%.