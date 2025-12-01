# Feature 6: Actualizar formulario de usuarios

**Branch:** `feature/driver-user-form-backoffice`  
**Estado:** `[x]` Completado

## Tasks

- [x] Crear branch desde `fixes`
- [x] Permitir que LOGISTICS_PROVIDER seleccione rol DRIVER en `user-form.tsx`
- [x] Permitir que SUPERVISOR seleccione rol DRIVER en `user-form.tsx`
- [x] Asignar automáticamente `logistics_provider_id` al crear usuario DRIVER
- [x] Actualizar `use-users.ts` para incluir DRIVER en filtros
- [x] Crear o actualizar tests en `user-form.test.tsx`
- [x] Ejecutar tests y verificar que pasan
- [x] Actualizar este archivo de tracking
- [x] Commit con mensaje descriptivo
- [x] Push del branch

## Archivos Modificados

- `src/components/users/user-form.tsx`
- `src/lib/hooks/use-users.ts`
- `src/components/users/__tests__/user-form.test.tsx` (actualizar o crear)

## Tests Escritos

- [x] Test: LOGISTICS_PROVIDER puede seleccionar rol DRIVER
- [x] Test: SUPERVISOR puede seleccionar rol DRIVER
- [x] Test: Formulario se renderiza correctamente para ambos roles
- [x] Test: Otros tests básicos del formulario

## Notas de Implementación

- Se agregó opción DRIVER para LOGISTICS_PROVIDER en el select de roles
- Se agregó opción DRIVER para SUPERVISOR en el select de roles
- Se implementó asignación automática de logistics_provider_id al crear usuario DRIVER (similar a SUPERVISOR)
- Se actualizó UsersFilters para incluir DRIVER en el tipo role
- Se agregaron tests para verificar que el formulario se renderiza correctamente para ambos roles
- Todos los tests pasan exitosamente (6 tests)

