# Sub-Plan 04: Delivery - Drivers y Vehículos

## Objetivo
Implementar el CRUD completo de drivers y vehículos, incluyendo asignación de vehículos a drivers y métricas de performance.

## Módulos a Implementar
1. **CRUD de Drivers:**
   - Listado de drivers con filtros
   - Formulario de creación/edición
   - Detalle de driver con métricas
   - Asignación de vehículos
   - Estados: AVAILABLE, BUSY, OFFLINE, SUSPENDED
2. **CRUD de Vehículos:**
   - Listado de vehículos con filtros
   - Formulario de creación/edición
   - Detalle de vehículo
   - Asignación a drivers
   - Estados: AVAILABLE, IN_SERVICE, MAINTENANCE, OUT_OF_SERVICE
3. **Asignación de Vehículos a Drivers:**
   - Selector de vehículo en formulario de driver
   - Visualización de vehículo asignado
   - Cambio de asignación
4. **Performance de Drivers:**
   - Métricas: total_deliveries, rating_avg
   - Visualización de estadísticas
   - Historial de entregas

## Dependencias Clave
- `@tanstack/react-query` (para hooks de datos)
- `react-hook-form`, `zod` (para formularios)
- `lucide-react` (para iconos)
- `shadcn/ui` (para componentes UI)

## Tests Unitarios
- Tests para los hooks de drivers
- Tests para los hooks de vehículos
- Tests para los formularios
- Tests para las métricas de performance

