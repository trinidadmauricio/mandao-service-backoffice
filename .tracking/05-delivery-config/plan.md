# Sub-Plan 05: Delivery - Configuración

## Objetivo
Implementar el CRUD completo de branches, delivery zones y delivery rates para configurar el sistema de entregas.

## Módulos a Implementar
1. **CRUD de Branches:**
   - Listado de branches con filtros
   - Formulario de creación/edición
   - Detalle de branch
   - Coordenadas geográficas (lat, lng)
   - Estados: active, inactive
2. **CRUD de Delivery Zones:**
   - Listado de zonas con filtros
   - Formulario de creación/edición
   - Detalle de zona
   - Boundary en formato WKT (PostGIS)
   - Tarifas base y por km
   - Surge multiplier
   - Estados: active, inactive
3. **CRUD de Delivery Rates:**
   - Listado de tarifas con filtros
   - Formulario de creación/edición
   - Detalle de tarifa
   - Asociación con zonas y tipos de vehículo
   - Rango de distancias (min, max)
   - Multiplicadores por prioridad
4. **Integración con Mapas (Opcional):**
   - Visualización básica de zonas
   - Selección de coordenadas para branches

## Dependencias Clave
- `@tanstack/react-query` (para hooks de datos)
- `react-hook-form`, `zod` (para formularios)
- `lucide-react` (para iconos)
- `shadcn/ui` (para componentes UI)

## Tests Unitarios
- Tests para los hooks de branches
- Tests para los hooks de delivery zones
- Tests para los hooks de delivery rates
- Tests para los formularios

