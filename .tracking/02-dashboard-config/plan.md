# Sub-Plan 02: Dashboard y Configuración

## Objetivo
Implementar el dashboard principal con KPIs y gráficos, configuración del tenant y gestión de usuarios.

## Alcance
- Dashboard con KPIs en tiempo real (GET /api/v1/reports/dashboard/kpis)
- Gráficos con Recharts (órdenes, revenue, distribución de estados, top productos)
- Configuración de tenant (GET/PATCH /api/v1/tenants/{id}) - solo OWNER
- Gestión de usuarios (GET/POST/PATCH/DELETE /api/v1/users) - OWNER/SUPERVISOR

## Endpoints a Usar
- `GET /api/v1/reports/dashboard/kpis?period=today|week|month|year`
- `GET /api/v1/tenants/{id}`
- `PATCH /api/v1/tenants/{id}`
- `GET /api/v1/users`
- `POST /api/v1/users`
- `GET /api/v1/users/{id}`
- `PATCH /api/v1/users/{id}`
- `DELETE /api/v1/users/{id}`

## Componentes a Crear
- DashboardPage con KPIs
- KPICard component
- OrdersChart (LineChart)
- RevenueChart (AreaChart)
- StatusDistributionChart (PieChart)
- TopProductsChart (BarChart)
- TenantSettingsPage
- TenantInfoForm
- UsersListPage
- UserForm
- UserDetailPage

## Restricciones por Rol
- Dashboard: Todos los roles (excepto CUSTOMER)
- Configuración Tenant: Solo OWNER
- Gestión Usuarios: OWNER (CRUD completo), SUPERVISOR (ver/editar)

## Criterios de Aceptación
- [ ] Dashboard muestra KPIs correctamente
- [ ] Gráficos funcionan y muestran datos
- [ ] Configuración de tenant solo accesible para OWNER
- [ ] Gestión de usuarios con restricciones por rol
- [ ] Tests unitarios para componentes principales

