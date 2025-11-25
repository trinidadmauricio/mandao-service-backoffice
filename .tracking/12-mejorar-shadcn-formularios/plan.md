# Plan: Mejorar uso de shadcn/ui en formularios del backoffice

## Objetivo
Migrar todos los formularios del backoffice para usar correctamente los componentes de shadcn/ui, reemplazando elementos HTML nativos por componentes estilizados y usando el patrón FormField recomendado.

## Análisis Actual
- **20 formularios** identificados que necesitan refactorización
- **Componentes faltantes:** `form.tsx`, `select.tsx`, `textarea.tsx`, `checkbox.tsx`
- **Problemas:** Uso de `<select>`, `<textarea>`, `<input type="checkbox">` nativos sin estilo
- **No existe `components.json`** - necesitamos configurarlo primero

## Estructura de Tracking
Los archivos de seguimiento se crearán en:
```
.tracking/12-mejorar-shadcn-formularios/
├── plan.md      # Este archivo
├── tasks.md     # Lista de tareas con checkboxes
└── summary.md   # Resumen de progreso y decisiones
```

## Fase 1: Configuración e Instalación de Componentes

### 1.1 Crear estructura de tracking
- Crear carpeta `.tracking/12-mejorar-shadcn-formularios/`
- Crear `plan.md` (este archivo)
- Crear `tasks.md` con lista de tareas inicial
- Crear `summary.md` vacío (se actualizará durante la ejecución)

### 1.2 Crear `components.json`
- Crear archivo de configuración de shadcn/ui en la raíz del proyecto
- Configurar paths: `@/components/ui`, `@/lib/utils`
- Configurar estilo: `default`
- Configurar rsc: `true` (Next.js App Router)
- Configurar tailwind: `tailwind.config.ts`
- Configurar aliases: `@/*` -> `src/*`

### 1.3 Instalar Componentes Faltantes
Instalar vía CLI de shadcn/ui:
- `form` - Componente principal de formularios con integración react-hook-form
- `select` - Select estilizado con Radix UI
- `textarea` - Textarea estilizado
- `checkbox` - Checkbox estilizado con Radix UI

**Archivos que se crearán:**
- `src/components/ui/form.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/checkbox.tsx`

## Fase 2: Refactorización de Formularios (Priorizados)

### 2.1 Formularios Críticos (Alta Prioridad)
Refactorizar estos formularios primero como referencia:

1. **`src/components/auth/login-form.tsx`**
   - Migrar a `Form` con `FormField`
   - Ya usa `Input` correctamente, solo necesita estructura `Form`
   - Archivo: `src/components/auth/login-form.tsx`

2. **`src/components/users/user-form.tsx`**
   - Reemplazar `<select>` nativo por `Select` (rol)
   - Reemplazar `<input type="checkbox">` por `Checkbox` (active)
   - Migrar a `Form` con `FormField`
   - Archivo: `src/components/users/user-form.tsx`

3. **`src/components/products/product-form.tsx`**
   - Reemplazar `<select>` nativo por `Select` (categoría, marca, estado)
   - Reemplazar `<textarea>` nativo por `Textarea` (descripción)
   - Migrar a `Form` con `FormField`
   - Archivo: `src/components/products/product-form.tsx`

4. **`src/components/drivers/driver-form.tsx`**
   - Reemplazar múltiples `<select>` nativos por `Select`
   - Reemplazar `<input type="checkbox">` por `Checkbox`
   - Migrar a `Form` con `FormField`
   - Archivo: `src/components/drivers/driver-form.tsx`

### 2.2 Formularios Restantes (Media Prioridad)
Refactorizar los 16 formularios restantes:

**Órdenes (6 formularios):**
- `src/components/orders/retail-order-form.tsx`
- `src/components/orders/on-demand-order-form.tsx`
- `src/components/orders/create-order-retail-form.tsx`
- `src/components/orders/create-order-ondemand-form.tsx`
- `src/components/orders/rating-form.tsx`
- `src/components/orders/delivery-proof-form.tsx`

**Otros (10 formularios):**
- `src/components/vehicles/vehicle-form.tsx`
- `src/components/branches/branch-form.tsx`
- `src/components/brands/brand-form.tsx`
- `src/components/categories/category-form.tsx`
- `src/components/delivery-zones/delivery-zone-form.tsx`
- `src/components/delivery-rates/delivery-rate-form.tsx`
- `src/components/logistics-providers/logistics-provider-form.tsx`
- `src/components/order-counters/order-counter-form.tsx`
- `src/components/products/product-variant-form.tsx`
- `src/components/auth/register-form.tsx`

## Fase 3: Patrón de Refactorización

### Estructura Antes (Actual)
```typescript
const { register, handleSubmit, formState: { errors } } = useForm();

<form onSubmit={handleSubmit(onSubmit)}>
  <Label htmlFor="name">Nombre</Label>
  <Input {...register('name')} />
  {errors.name && <p>{errors.name.message}</p>}
  
  <select {...register('role')}>
    <option value="">Selecciona</option>
  </select>
</form>
```

### Estructura Después (Objetivo)
```typescript
const form = useForm();

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nombre</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    
    <FormField
      control={form.control}
      name="role"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Rol</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

## Fase 4: Mejoras Adicionales

### 4.1 Validación Visual
- Asegurar que todos los errores se muestren con `FormMessage`
- Agregar estados de loading consistentes
- Mejorar feedback visual en campos requeridos

### 4.2 Accesibilidad
- Verificar que todos los componentes tengan labels correctos
- Asegurar navegación por teclado
- Verificar ARIA attributes

### 4.3 Consistencia
- Unificar estilos de errores
- Unificar estilos de campos deshabilitados
- Unificar spacing y layout

## Criterios de Aceptación

- [ ] Estructura de tracking creada (`.tracking/12-mejorar-shadcn-formularios/`)
- [ ] `components.json` creado y configurado
- [ ] 4 componentes de shadcn/ui instalados (form, select, textarea, checkbox)
- [ ] 4 formularios críticos refactorizados y funcionando
- [ ] 16 formularios restantes refactorizados
- [ ] Todos los `<select>` nativos reemplazados por `Select`
- [ ] Todos los `<textarea>` nativos reemplazados por `Textarea`
- [ ] Todos los `<input type="checkbox">` reemplazados por `Checkbox`
- [ ] Todos los formularios usan el patrón `Form` con `FormField`
- [ ] Tests existentes siguen pasando (o actualizados)
- [ ] No hay regresiones visuales
- [ ] `summary.md` actualizado con progreso final

## Notas Técnicas

- **Mantener compatibilidad:** Los formularios deben seguir funcionando igual funcionalmente
- **No romper tests:** Actualizar tests si es necesario pero mantener cobertura
- **Incremental:** Refactorizar formulario por formulario, probando cada uno
- **Reutilización:** Crear helpers si hay patrones repetitivos en la refactorización
- **Tracking:** Actualizar `tasks.md` y `summary.md` durante la ejecución

