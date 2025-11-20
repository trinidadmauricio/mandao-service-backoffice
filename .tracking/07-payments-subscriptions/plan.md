# Sub-Plan 07: Pagos y Suscripciones

## Objetivo
Implementar el sistema completo de gestión de pagos y suscripciones, incluyendo visualización de transacciones, procesamiento de refunds, y gestión de planes de suscripción.

## Módulos a Implementar
1. **Gestión de Pagos:**
   - Listado de transacciones con filtros (fecha, estado, tipo)
   - Detalle de transacciones
   - Detalle de pagos por orden
   - Procesar refunds (reembolsos)
   - Visualización de webhooks de Stripe
2. **Gestión de Suscripciones:**
   - Visualización de plan actual
   - Cambiar plan de suscripción
   - Iniciar trial
   - Convertir trial a suscripción
   - Ver límites y uso actual
   - Dashboard de métricas de consumo

## Dependencias Clave
- `@tanstack/react-query` (para hooks de datos)
- `react-hook-form`, `zod` (para formularios)
- `lucide-react` (para iconos)
- `shadcn/ui` (para componentes UI)
- `recharts` (para gráficos de uso)

## Restricciones por Rol
- **OWNER**: Acceso completo (pagos, refunds, cambio de plan)
- **SUPERVISOR**: Ver transacciones y procesar refunds
- **MERCHANT_USER, CUSTOMER**: Sin acceso

## Tests Unitarios
- Tests para los hooks de pagos
- Tests para los hooks de suscripciones
- Tests para los formularios de refunds
- Tests para el cambio de plan

