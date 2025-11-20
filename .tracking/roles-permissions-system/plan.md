# Plan: Sistema Completo de Roles, Permisos y Acceso - Backoffice

## Objetivo

Implementar un sistema completo, estándar y consistente de roles, permisos y acceso en el backoffice que considere: nuevos roles (LOGISTICS_PROVIDER), exclusión de CUSTOMER del backoffice, soporte para tenants HYBRID, y aplicación consistente en todas las páginas, componentes y acciones.

## Decisión Arquitectónica: Almacenamiento

**Roles y Permisos en Código:**
- Consistente con backend
- Type safety con TypeScript
- Performance (sin queries a DB)
- Fácil de mantener

**Información del Usuario:**
- Obtener desde contexto de autenticación
- Cachear con TanStack Query
- Incluir: role, tenant, logistics_provider_id

## Fases del Plan

### Fase 1: Actualizar Constantes
- Actualizar roles (agregar LOGISTICS_PROVIDER, eliminar CUSTOMER del contexto backoffice)
- Actualizar matriz de permisos completa
- Asegurar consistencia con backend

### Fase 2: Crear Hooks
- Hook useTenant para obtener información del tenant
- Mejorar hook usePermissions
- Crear hook useLogisticsProvider

### Fase 3: Crear Componentes
- Componente PermissionGuard estándar
- Mejorar RoleGuard existente si es necesario

### Fase 4: Actualizar Sidebar
- Aplicar permisos a todos los items
- Considerar tenant type
- Ocultar secciones no permitidas
- Considerar logistics provider

### Fase 5: Aplicar en Páginas
- Aplicar permisos en todas las páginas
- Validar tenant type en formularios
- Validar logistics provider donde corresponde

### Fase 6: Mejorar UX
- Mensajes claros cuando operaciones no están disponibles
- Prevenir acciones no permitidas
- Feedback visual de permisos

## Secciones del Backoffice

- Dashboard
- Órdenes (lista, crear on-demand, crear retail, detalle, acciones)
- Productos (lista, crear, editar, eliminar)
- Categorías (lista, crear, editar, eliminar)
- Marcas (lista, crear, editar, eliminar)
- Drivers (lista, crear, editar, eliminar)
- Vehículos (lista, crear, editar, eliminar)
- Sucursales (lista, crear, editar, eliminar)
- Zonas de Entrega (lista, crear, editar, eliminar)
- Tarifas de Entrega (lista, crear, editar, eliminar)
- Proveedores Logísticos (lista, crear, editar, eliminar)
- Usuarios (lista, crear, editar, eliminar)
- Pagos / Transacciones
- Reportes
- Suscripción
- Contadores de Órdenes
- Configuración / Settings

## Acceso por Rol

### SAAS_ADMIN / SAAS_EDITOR
- Todas las secciones (con selector de tenant)

### OWNER
- Todas las secciones de su tenant (según tenant type)

### SUPERVISOR
- Secciones operativas (sin configuración avanzada)

### MERCHANT_USER
- Secciones básicas de retail

### LOGISTICS_PROVIDER
- Secciones específicas de su proveedor (órdenes asignadas, drivers, vehicles, usuarios de su proveedor)

### CUSTOMER
- Ninguna sección del backoffice (solo storefront)

## Validaciones de Tenant Type

- **RETAIL o HYBRID:** Productos, Categorías, Marcas, Crear orden retail
- **ON_DEMAND o HYBRID:** Drivers, Vehículos, Zonas, Tarifas, Proveedores, Crear orden on-demand
- **Todos:** Dashboard, Órdenes (lectura), Sucursales, Usuarios, Pagos, Reportes, Suscripción

## Archivos Clave

- `src/lib/constants/roles.ts` - Roles y permisos
- `src/lib/hooks/use-tenant.ts` - Hook tenant (NUEVO)
- `src/lib/hooks/use-permissions.ts` - Hook permisos (mejorar)
- `src/lib/hooks/use-logistics-provider.ts` - Hook logistics (NUEVO)
- `src/components/auth/permission-guard.tsx` - Componente protección (NUEVO o mejorar)
- `src/components/layout/sidebar.tsx` - Sidebar con permisos
- Todas las páginas del dashboard

