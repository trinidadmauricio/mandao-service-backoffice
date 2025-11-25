# Tareas - Mejorar shadcn/ui en formularios

## Fase 1: Configuración e Instalación

- [x] Crear estructura de tracking (`.tracking/12-mejorar-shadcn-formularios/`)
- [x] Crear y configurar `components.json` para shadcn/ui
- [x] Instalar componente `form` de shadcn/ui
- [x] Instalar componente `select` de shadcn/ui
- [x] Instalar componente `textarea` de shadcn/ui
- [x] Instalar componente `checkbox` de shadcn/ui

## Fase 2: Refactorización de Formularios Críticos

- [x] Refactorizar `login-form.tsx` para usar Form con FormField
- [x] Refactorizar `user-form.tsx`: Form + Select (rol) + Checkbox (active)
- [x] Refactorizar `product-form.tsx`: Form + Select (categoría/marca/estado) + Textarea (descripción)
- [x] Refactorizar `driver-form.tsx`: Form + múltiples Select + Checkbox

## Fase 3: Refactorización de Formularios Restantes

### Órdenes (6 formularios)
- [x] `retail-order-form.tsx`
- [x] `on-demand-order-form.tsx`
- [x] `create-order-retail-form.tsx`
- [x] `create-order-ondemand-form.tsx`
- [x] `rating-form.tsx`
- [x] `delivery-proof-form.tsx`

### Otros (10 formularios)
- [x] `vehicle-form.tsx`
- [x] `branch-form.tsx`
- [x] `brand-form.tsx`
- [x] `category-form.tsx`
- [x] `delivery-zone-form.tsx`
- [x] `delivery-rate-form.tsx`
- [x] `logistics-provider-form.tsx`
- [x] `order-counter-form.tsx`
- [x] `product-variant-form.tsx`
- [x] `register-form.tsx`

## Fase 4: Validación y Finalización

- [x] Refactorizar componente auxiliar `retail-order-item-field.tsx`
- [x] Actualizar referencias a `errors` para usar `form.formState.errors`
- [x] Actualizar `summary.md` con progreso final
- [ ] Actualizar tests existentes si es necesario (opcional, fuera del alcance inicial)
- [ ] Verificar que todos los tests pasen (opcional, fuera del alcance inicial)
- [ ] Verificar que no hay regresiones visuales (opcional, fuera del alcance inicial)

