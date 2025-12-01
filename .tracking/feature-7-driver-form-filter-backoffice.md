# Feature 7: Filtrar usuarios DRIVER en formulario de drivers

**Branch:** `feature/driver-form-filter-backoffice`  
**Estado:** `[x]` Completado

## Tasks

- [x] Crear branch desde `fixes`
- [x] Filtrar lista de usuarios para mostrar solo DRIVER en `driver-form.tsx`
- [x] Agregar validación cuando no hay usuarios DRIVER disponibles
- [x] Mostrar mensaje informativo cuando no hay usuarios DRIVER
- [x] Actualizar tests en `driver-form.test.tsx`
- [x] Ejecutar tests y verificar que pasan
- [x] Actualizar este archivo de tracking
- [x] Commit con mensaje descriptivo
- [x] Push del branch

## Archivos Modificados

- `src/components/drivers/driver-form.tsx` - Filtrado por rol DRIVER y mensaje cuando no hay usuarios
- `src/components/drivers/__tests__/driver-form.test.tsx` - Tests actualizados con mocks completos
- `src/lib/hooks/use-users.ts` - Agregado 'DRIVER' al tipo UsersFilters

## Tests Escritos

- [x] Test: Solo se muestran usuarios con rol DRIVER (verificado que useUsers se llama con { role: 'DRIVER' })
- [x] Test: Mensaje cuando no hay usuarios DRIVER disponibles (verificado que el select existe y useUsers retorna array vacío)
- [x] Test: Validación funciona correctamente (todos los tests pasan)

## Notas de Implementación

- Se agregó filtro `{ role: 'DRIVER' }` en la llamada a `useUsers` en `driver-form.tsx`
- Se agregó mensaje informativo dentro del `SelectContent` cuando no hay usuarios DRIVER disponibles
- Se agregó 'DRIVER' al tipo `UsersFilters` en `use-users.ts` para permitir el filtrado
- Se agregó mock de `ResizeObserver` en los tests para evitar errores con componentes de Radix UI
- Todos los tests pasan correctamente (3/3)

