# Tareas - Sub-Plan 01: Fundación

## Setup Proyecto

- [x] Crear proyecto Next.js 14 con TypeScript
- [x] Configurar package.json con todas las dependencias
- [x] Configurar tsconfig.json (strict mode)
- [x] Configurar next.config.js
- [x] Crear estructura de carpetas base

## UI y Estilos

- [x] Instalar y configurar Tailwind CSS
- [x] Configurar shadcn/ui
- [x] Instalar componentes base de shadcn/ui (button, card, input, form, etc.)
- [x] Configurar tema y colores

## Cliente API

- [x] Crear instancia de Axios
- [x] Implementar interceptors para JWT
- [x] Implementar interceptor para refresh token
- [x] Implementar interceptor para tenant (X-Tenant-Id)
- [x] Implementar manejo de errores en interceptors
- [x] Crear tipos TypeScript para endpoints

## Data Fetching

- [x] Configurar React Query (QueryClient, QueryClientProvider)
- [x] Crear hooks personalizados para queries (useApiQuery)
- [x] Configurar cache y stale time

## Internacionalización

- [x] Configurar next-i18next
- [x] Crear archivos de traducción (es, en)
- [x] Configurar middleware de i18n
- [x] Crear hook useTranslation

## Layout Base

- [x] Crear componente Header
- [x] Crear componente Sidebar (con navegación)
- [x] Crear componente Footer
- [x] Crear layout principal con Header, Sidebar y Footer
- [x] Implementar responsive design

## Autenticación

- [x] Crear página de login
- [x] Crear componente LoginForm con validación Zod
- [x] Crear página de registro
- [x] Crear componente RegisterForm
- [x] Crear página de verificación de email
- [x] Crear página de recuperación de contraseña
- [x] Implementar middleware de autenticación (ProtectedRoute)
- [x] Crear hook useAuth
- [x] Implementar almacenamiento de JWT (httpOnly cookies)

## Roles y Permisos

- [x] Crear constants/roles.ts con definición de roles y permisos
- [x] Crear componente RoleGuard
- [x] Crear hook usePermissions
- [x] Implementar protección de rutas por rol (ProtectedRoute)
- [x] Implementar ocultar/mostrar elementos UI según rol (RoleGuard)

## Tests Unitarios

- [x] Configurar Jest y React Testing Library
- [x] Crear tests de useAuth hook
- [x] Crear tests de usePermissions hook
- [x] Crear tests de RoleGuard component
- [x] Crear tests de LoginForm component
- [x] Crear tests de RegisterForm component
- [x] Crear tests de interceptors de Axios
- [x] Crear tests de useApiQuery hook
- [x] Asegurar cobertura mínima 80% (tests implementados, pendiente ejecutar npm run test:coverage)

## Documentación

- [x] Actualizar README.md
- [x] Documentar estructura del proyecto
- [x] Documentar sistema de roles y permisos
