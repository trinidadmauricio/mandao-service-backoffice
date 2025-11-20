# Sub-Plan 09: Funcionalidades Adicionales

## Objetivo
Implementar los módulos de Order Counters y Logistics Providers para completar las funcionalidades adicionales del sistema.

## Módulos a Implementar
1. **Order Counters (Contadores de Órdenes):**
   - Gestión de contadores para generar números de orden secuenciales
   - Configuración de prefijo y padding
   - Visualización y actualización del valor actual
   - Incremento manual del contador
   - Reset del contador
2. **Logistics Providers (Proveedores Logísticos):**
   - CRUD completo de proveedores logísticos
   - Gestión de información de empresa y representante legal
   - Estados de verificación y activación
   - Soporte para proveedores globales (tenant_id = null)

## Dependencias Clave
- `@tanstack/react-query` (para hooks de datos)
- `react-hook-form`, `zod` (para formularios)
- `lucide-react` (para iconos)
- `shadcn/ui` (para componentes UI)

## Restricciones por Rol
- **OWNER, SUPERVISOR**: Acceso completo
- **MERCHANT_USER, CUSTOMER**: Sin acceso

## Tests Unitarios
- Tests para los hooks de order counters
- Tests para los hooks de logistics providers
- Tests para los formularios

