# Sub-Plan 06: Órdenes

## Objetivo
Implementar el sistema completo de gestión de órdenes, incluyendo creación (on-demand y retail), listado, detalle con historial, y todas las operaciones de modificación siguiendo el patrón inmutable.

## Módulos a Implementar
1. **Listado de Órdenes:**
   - Tabla con filtros (estado, tipo, fecha)
   - Búsqueda por número de orden o tracking code
   - Paginación
   - Estados: DRAFT, PENDING, CONFIRMED, ASSIGNED, IN_TRANSIT, DELIVERED, CANCELLED, FAILED
2. **Crear Orden On-Demand:**
   - Formulario completo con customer_snapshot
   - Dirección de entrega y pickup (opcional)
   - Items con product_snapshot
   - Prioridad y fechas
3. **Crear Orden Retail:**
   - Formulario con selección de productos del catálogo
   - Selección de variants
   - Branch selection
   - Customer snapshot
4. **Detalle de Orden:**
   - Información completa de la orden
   - Historial de cambios (drivers, branches, items, totals)
   - Timeline de estados
   - Items actuales
5. **Operaciones de Modificación (Inmutables):**
   - Asignar driver
   - Cambiar branch
   - Modificar items
   - Recalcular totales
   - Actualizar estado
   - Cancelar orden
6. **Delivery Features:**
   - Delivery proof (fotos, firmas)
   - Rating
7. **Tracking Público:**
   - Página pública sin autenticación
   - Visualización de estado de orden por tracking code

## Dependencias Clave
- `@tanstack/react-query` (para hooks de datos)
- `react-hook-form`, `zod` (para formularios)
- `lucide-react` (para iconos)
- `shadcn/ui` (para componentes UI)
- `recharts` (para timeline/gráficos si es necesario)

## Tests Unitarios
- Tests para los hooks de órdenes
- Tests para los formularios de creación
- Tests para las operaciones de modificación
- Tests para el tracking público

