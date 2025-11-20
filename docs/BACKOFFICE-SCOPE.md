# Alcance del Backoffice - Mandao Service

## Visión General

El **Backoffice** es el panel administrativo web que permite a los merchants (tenants) gestionar su operación de delivery. Es una aplicación frontend que consume la API de `mandao-service-api`.

## Funcionalidades Principales

### 1. Autenticación y Autorización
- **Login/Registro** tradicional
- **OAuth2 Authorization Code Flow** (para integraciones)
- **Gestión de sesiones** con refresh tokens
- **Multi-tenant isolation** (cada merchant solo ve sus datos)
- **Roles y permisos** (admin, manager, operator)

### 2. Dashboard Principal
- **KPIs en tiempo real:**
  - Órdenes del día
  - Órdenes pendientes
  - Revenue del día/mes
  - Drivers activos
  - Tasa de completitud
- **Gráficos y métricas:**
  - Órdenes por estado
  - Revenue por período
  - Performance de drivers
  - Productos más vendidos (retail)

### 3. Gestión de Órdenes
- **Listado de órdenes** con filtros:
  - Por estado (pending, confirmed, assigned, in_transit, delivered, cancelled)
  - Por fecha
  - Por driver
  - Por branch
  - Por tipo (on-demand, retail)
- **Crear orden on-demand:**
  - Datos del cliente
  - Dirección de entrega
  - Items (descripción libre)
  - Branch de origen
- **Crear orden retail:**
  - Selección de productos del catálogo
  - Variants y cantidades
  - Validación de stock
- **Detalle de orden:**
  - Información completa
  - Historial de cambios (inmutabilidad)
  - Timeline de estados
  - Items y totals
  - Información del driver asignado
  - Direcciones (pickup y delivery)
- **Acciones sobre órdenes:**
  - Asignar/cambiar driver
  - Cambiar branch
  - Modificar items (solo en estados permitidos)
  - Actualizar estado
  - Cancelar orden
  - Ver tracking público

### 4. Gestión de Drivers
- **CRUD completo de drivers:**
  - Crear, editar, listar, eliminar
  - Información personal
  - Estado (active, inactive, busy)
  - Capacidad (máximo de órdenes simultáneas)
- **Asignación de vehículos:**
  - Asignar vehículo a driver
  - Cambiar vehículo
  - Ver historial de asignaciones
- **Performance de drivers:**
  - Órdenes completadas
  - Tiempo promedio de entrega
  - Rating promedio
  - Revenue generado

### 5. Gestión de Vehículos
- **CRUD completo de vehículos:**
  - Tipo (bike, motorcycle, car, van, truck)
  - Placa/license
  - Capacidad
  - Estado (available, in_use, maintenance)
- **Asignación a drivers:**
  - Ver drivers asignados
  - Historial de asignaciones

### 6. Gestión de Branches (Sucursales)
- **CRUD completo de branches:**
  - Nombre, dirección
  - Coordenadas (lat/lng)
  - Horarios de operación
  - Estado (active, inactive)
- **Configuración:**
  - Zonas de delivery
  - Rates por zona
  - Stock por branch (retail)

### 7. Catálogo de Productos (Retail)
- **CRUD de productos:**
  - Información básica (nombre, descripción, SKU)
  - Categorías y tags
  - Imágenes
  - Estado (active, inactive, draft)
- **Variants:**
  - Crear variants (talla, color, etc.)
  - Precios por variant
  - Stock por variant y branch
- **Gestión de inventario:**
  - Stock actual por branch
  - Movimientos de inventario
  - Reservas de stock
  - Alertas de stock bajo

### 8. Gestión de Inventario (Retail)
- **Stock por branch:**
  - Ver stock actual
  - Ajustes manuales
  - Transferencias entre branches
- **Movimientos:**
  - Historial completo
  - Filtros por producto, branch, tipo
  - Export a CSV
- **Reservas:**
  - Ver reservas activas
  - Liberar reservas expiradas

### 9. Proveedores Logísticos
- **CRUD de logistics providers:**
  - Información de contacto
  - Configuración de integración
  - Estado (active, inactive)
- **Asignación a drivers:**
  - Ver drivers por proveedor

### 10. Pagos
- **Transacciones:**
  - Listado de pagos
  - Filtros por estado, fecha, orden
  - Detalle de transacción
- **Stripe Integration:**
  - Ver checkout sessions
  - Procesar refunds
  - Ver webhooks recibidos
- **Reportes de pagos:**
  - Revenue por período
  - Métodos de pago
  - Tasa de éxito/fallo

### 11. Suscripciones
- **Plan actual:**
  - Ver plan activo
  - Límites del plan (productos, órdenes, branches)
  - Uso actual vs límites
- **Upgrade/Downgrade:**
  - Cambiar de plan
  - Ver planes disponibles
  - Billing information
- **Historial de facturación:**
  - Invoices
  - Pagos realizados
  - Próximos pagos

### 12. Reportes y Analytics
- **Reporte de órdenes:**
  - Filtros avanzados
  - Export a CSV
  - Gráficos
- **Reporte de inventario:**
  - Stock actual
  - Movimientos
  - Productos más vendidos
- **Reporte de drivers:**
  - Performance
  - Revenue por driver
  - Tiempo promedio
- **Dashboard analytics:**
  - KPIs personalizables
  - Comparativas por período
  - Tendencias

### 13. Configuración del Tenant
- **Información general:**
  - Nombre, logo
  - Contacto
  - Currency (USD, EUR, MXN, etc.)
  - Locale (es, en, etc.)
- **Configuración de delivery:**
  - Zonas de delivery
  - Rates por zona
  - Tiempos estimados
- **Configuración de retail:**
  - Theme del storefront
  - Configuración de checkout
  - Políticas de devolución

### 14. Usuarios y Permisos
- **Gestión de usuarios:**
  - Crear, editar, eliminar usuarios
  - Asignar roles
  - Activar/desactivar usuarios
- **Roles:**
  - Admin (acceso total)
  - Manager (gestión operativa)
  - Operator (solo órdenes)
  - Viewer (solo lectura)

### 15. Tracking Público
- **Vista de tracking:**
  - Ver tracking como lo vería un cliente
  - Generar link de tracking
  - Compartir tracking

## Stack Tecnológico Recomendado para Backoffice

### Frontend Framework
- **React 18** o **Next.js 14** (SSR opcional)
- **TypeScript 5.3**
- **Tailwind CSS** o **Material-UI** para UI

### State Management
- **Zustand** o **Redux Toolkit**
- **React Query** para data fetching y caching

### Routing
- **React Router** (si React) o **Next.js Router** (si Next.js)

### Forms
- **React Hook Form** + **Zod** para validación

### HTTP Client
- **Axios** con interceptors para:
  - JWT token injection
  - Refresh token rotation
  - Error handling
  - Tenant context

### UI Components
- **shadcn/ui** (si Tailwind) o **Material-UI**
- **Recharts** o **Chart.js** para gráficos
- **React Table** para tablas

### Build Tools
- **Vite** (si React) o **Next.js** (si Next.js)
- **ESBuild** para builds rápidos

## Integración con la API

### Autenticación
```typescript
// Flujo de autenticación
1. Login → POST /api/v1/auth/login
2. Recibir access_token y refresh_token
3. Guardar tokens en localStorage o httpOnly cookies
4. Inyectar access_token en headers: Authorization: Bearer {token}
5. Si token expira, usar refresh_token → POST /api/v1/auth/refresh
6. Si refresh falla, redirigir a login
```

### Multi-Tenancy
```typescript
// El tenant_id viene en el JWT
// No es necesario enviarlo explícitamente en requests
// La API lo extrae del token automáticamente
```

### Manejo de Errores
```typescript
// Interceptor de Axios
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Intentar refresh token
      // Si falla, redirigir a login
    }
    // Mostrar mensaje de error traducido
    return Promise.reject(error);
  }
);
```

## Flujos Principales

### 1. Login Flow
```
1. Usuario ingresa credenciales
2. POST /api/v1/auth/login
3. Guardar tokens
4. Redirigir a dashboard
5. Cargar datos iniciales (tenant info, KPIs)
```

### 2. Crear Orden On-Demand
```
1. Usuario llena formulario
2. Validar datos (Zod)
3. POST /api/v1/orders (type: ON_DEMAND)
4. Mostrar orden creada
5. Opcional: asignar driver inmediatamente
```

### 3. Crear Orden Retail
```
1. Usuario selecciona productos del catálogo
2. Selecciona variants y cantidades
3. Validar stock disponible
4. POST /api/v1/orders (type: RETAIL)
5. Stock se reserva automáticamente
6. Mostrar orden creada
```

### 4. Asignar Driver
```
1. Usuario selecciona orden
2. Ver drivers disponibles
3. POST /api/v1/orders/{id}/assign-driver
4. Actualizar UI con nuevo driver
5. Mostrar notificación de éxito
```

### 5. Ver Detalle de Orden
```
1. Usuario hace click en orden
2. GET /api/v1/orders/{id}
3. Cargar historial de cambios
4. Cargar timeline de estados
5. Mostrar información completa
```

## Consideraciones de UX

### Performance
- **Lazy loading** de rutas
- **Code splitting** por feature
- **Virtual scrolling** para listas grandes
- **Pagination** en tablas
- **Debounce** en búsquedas

### Responsive Design
- **Mobile-first** approach
- **Breakpoints:** mobile, tablet, desktop
- **Touch-friendly** en mobile

### Accesibilidad
- **ARIA labels** en componentes
- **Keyboard navigation**
- **Screen reader support**
- **Contrast ratios** adecuados

### Internacionalización
- **i18next** para traducciones
- **Formato de fechas** según locale
- **Formato de currency** según tenant
- **RTL support** (opcional)

## Seguridad

### Frontend
- **No almacenar tokens** en localStorage (preferir httpOnly cookies)
- **Sanitizar inputs** antes de enviar
- **Validar datos** en cliente y servidor
- **HTTPS** obligatorio en producción

### Autenticación
- **Refresh token rotation**
- **Logout** limpia tokens
- **Session timeout** después de inactividad
- **CSRF protection** (si usa cookies)

## Testing

### Unit Tests
- **Jest** + **React Testing Library**
- **Cobertura mínima:** 80%
- **Mockear** llamadas a API

### Integration Tests
- **Cypress** o **Playwright**
- **Flujos críticos:**
  - Login
  - Crear orden
  - Asignar driver
  - Ver reportes

## Roadmap de Implementación

### Fase 1: Fundación (Semana 1-2)
- Setup proyecto (React/Next.js + TypeScript)
- Configurar routing
- Setup de autenticación (login, tokens)
- Layout base (header, sidebar, footer)
- Integración con API (Axios setup)

### Fase 2: Dashboard y Órdenes (Semana 3-4)
- Dashboard con KPIs
- Listado de órdenes
- Crear orden on-demand
- Detalle de orden
- Asignar driver

### Fase 3: Drivers y Vehículos (Semana 5)
- CRUD drivers
- CRUD vehículos
- Asignación de vehículos
- Performance de drivers

### Fase 4: Retail (Semana 6-7)
- CRUD productos
- Gestión de variants
- Gestión de inventario
- Crear orden retail

### Fase 5: Reportes y Configuración (Semana 8)
- Reportes básicos
- Export a CSV
- Configuración de tenant
- Gestión de usuarios

### Fase 6: Pagos y Suscripciones (Semana 9)
- Vista de pagos
- Gestión de suscripciones
- Billing

### Fase 7: Optimización (Semana 10)
- Performance optimization
- Testing
- Bug fixes
- Polish UI/UX

## Métricas de Éxito

### Performance
- **Time to Interactive (TTI):** < 3s
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s

### UX
- **Task completion rate:** > 90%
- **Error rate:** < 5%
- **User satisfaction:** > 4/5

### Business
- **Adoption rate:** > 80% de merchants activos
- **Feature usage:** > 70% de features usadas regularmente

---

**Última actualización:** 2024-01-15
**Versión:** 1.0

