# Sub-Plan 08: Reportes

## Objetivo
Implementar el sistema completo de reportes con visualización de datos, filtros avanzados, exportación a CSV y gráficos interactivos.

## Módulos a Implementar
1. **Reporte de Órdenes:**
   - Página con filtros (fecha, estado)
   - Tabla de órdenes con métricas
   - Gráficos de tendencias
   - Export a CSV
2. **Reporte de Inventario:**
   - Filtros por categoría
   - Filtro de stock bajo
   - Lista de productos con stock
   - Alertas de stock bajo
3. **Reporte de Drivers:**
   - Filtros por fecha y driver
   - Métricas de rendimiento
   - Gráficos comparativos
4. **Gráficos Interactivos:**
   - Integración con Recharts
   - Gráficos de líneas, barras, pastel y área
   - Visualización de tendencias y comparativas

## Dependencias Clave
- `@tanstack/react-query` (para hooks de datos)
- `recharts` (para gráficos)
- `lucide-react` (para iconos)
- `shadcn/ui` (para componentes UI)
- `date-fns` (para manejo de fechas)

## Restricciones por Rol
- **OWNER, SUPERVISOR**: Acceso completo a todos los reportes
- **MERCHANT_USER**: Solo reportes básicos (órdenes, inventario)
- **CUSTOMER**: Sin acceso

## Tests Unitarios
- Tests para los hooks de reportes
- Tests para los componentes de gráficos
- Tests para la exportación CSV

