# Sub-Plan 01: Fundación

## Objetivo
Establecer la base del proyecto Next.js 14 con todas las configuraciones necesarias, sistema de autenticación, roles y permisos.

## Alcance
- Setup completo del proyecto Next.js 14 con TypeScript
- Configuración de shadcn/ui y Tailwind CSS
- Cliente Axios con interceptors para JWT, refresh token y tenant
- React Query para data fetching
- i18n con next-i18next
- Layout base con Header, Sidebar y Footer
- Sistema de autenticación completo (login, register, verify-email, password reset)
- Sistema de roles y permisos (RoleGuard, usePermissions, constants/roles.ts)
- Tests unitarios de componentes base y hooks

## Stack Tecnológico
- Next.js 14 (App Router)
- TypeScript 5.3
- Tailwind CSS
- shadcn/ui
- React Query (TanStack Query)
- Axios
- React Hook Form + Zod
- next-i18next
- Jest + React Testing Library

## Estructura de Archivos a Crear
```
mandao-service-backoffice/
├── .tracking/01-fundacion/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── verify-email/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/ (shadcn/ui components)
│   │   ├── layout/
│   │   └── auth/
│   ├── lib/
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── constants/
│   ├── types/
│   └── i18n/
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── jest.config.js
```

## Criterios de Aceptación
- [ ] Proyecto Next.js 14 funcionando con TypeScript
- [ ] shadcn/ui configurado y funcionando
- [ ] Tailwind CSS funcionando
- [ ] Axios configurado con interceptors
- [ ] React Query configurado
- [ ] i18n funcionando con next-i18next
- [ ] Layout base implementado
- [ ] Sistema de autenticación completo
- [ ] Sistema de roles y permisos funcionando
- [ ] Tests unitarios con cobertura mínima 80%

## Notas
- Seguir las reglas del proyecto (.cursorrules)
- TypeScript estricto (no `any`)
- Validación con Zod
- TDD: escribir tests antes de implementar

