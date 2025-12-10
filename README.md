# Mandao Service Backoffice

Panel administrativo web para gestionar operaciones de delivery multi-tenant.

## Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript 5.3
- **UI:** React 18, Tailwind CSS, shadcn/ui
- **State Management:** TanStack Query (React Query)
- **Formularios:** React Hook Form + Zod
- **HTTP Client:** Axios
- **Gráficos:** Recharts
- **Testing:** Jest + React Testing Library
- **i18n:** next-i18next

## Requisitos Previos

- Node.js 20 LTS o superior
- npm o yarn
- Acceso a la API de Mandao Service

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus configuraciones
```

## Variables de Entorno

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Nota:** `NEXT_PUBLIC_API_URL` debe ser solo la URL base (sin `/api/v1`), ya que el prefijo `/api/v1` está incluido automáticamente en todos los endpoints.

## Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# El servidor estará disponible en http://localhost:3000
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint

# Tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:coverage
```

## Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación
│   ├── (dashboard)/       # Rutas del dashboard (protegidas)
│   └── (public)/          # Rutas públicas
├── components/             # Componentes React
│   ├── auth/              # Componentes de autenticación
│   ├── orders/            # Componentes de órdenes
│   ├── payments/          # Componentes de pagos
│   ├── reports/           # Componentes de reportes
│   └── ui/                # Componentes UI base (shadcn/ui)
├── lib/                   # Utilidades y configuraciones
│   ├── api/               # Cliente API y endpoints
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utilidades
│   └── constants/         # Constantes
└── types/                 # Tipos TypeScript
```

## Características Principales

### Autenticación y Autorización
- Login/Registro tradicional
- JWT tokens con refresh
- Roles y permisos (OWNER, SUPERVISOR, MERCHANT_USER, CUSTOMER)
- Multi-tenant isolation

### Dashboard
- KPIs en tiempo real
- Gráficos interactivos
- Métricas de rendimiento

### Gestión de Órdenes
- Listado con filtros avanzados
- Creación de órdenes (on-demand y retail)
- Detalle completo con historial inmutable
- Asignación de drivers
- Modificación de items
- Tracking público

### Gestión de Drivers y Vehículos
- CRUD completo
- Asignación de vehículos
- Gestión de disponibilidad

### Retail (E-commerce)
- CRUD de productos
- Gestión de variantes
- Gestión de inventario
- Categorías y marcas

### Pagos y Suscripciones
- Visualización de transacciones
- Procesamiento de refunds
- Gestión de planes de suscripción
- Límites y uso

### Reportes
- Reporte de órdenes
- Reporte de inventario
- Reporte de drivers
- Exportación a CSV
- Gráficos interactivos

### Configuración
- Gestión de sucursales
- Zonas de entrega
- Tarifas de entrega
- Contadores de órdenes
- Proveedores logísticos

## Docker

### Construcción de la Imagen

**IMPORTANTE:** Las variables de entorno que comienzan con `NEXT_PUBLIC_*` se inyectan en **build time**, no en runtime. Por lo tanto, debes pasarlas durante la construcción de la imagen usando `--build-arg`.

El Dockerfile está configurado para leer estas variables de los `--build-arg` que pases durante el build:

```bash
# Opción 1: Pasar valores directamente
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.tudominio.com \
  --build-arg NEXT_PUBLIC_APP_URL=https://backoffice.tudominio.com \
  -t mandao-backoffice:latest \
  .

# Opción 2: Usar variables de entorno de tu sistema
export NEXT_PUBLIC_API_URL=https://api.tudominio.com
export NEXT_PUBLIC_APP_URL=https://backoffice.tudominio.com

docker build \
  --build-arg NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
  --build-arg NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL} \
  -t mandao-backoffice:latest \
  .

# Opción 3: Usar un archivo .env (requiere docker-compose o script)
# Crear un archivo .env.build con:
# NEXT_PUBLIC_API_URL=https://api.tudominio.com
# NEXT_PUBLIC_APP_URL=https://backoffice.tudominio.com
# Luego usar un script que lea el archivo y pase los --build-arg
```

### Ejecutar el Contenedor

```bash
# Ejecutar el contenedor (las variables NEXT_PUBLIC_* ya están compiladas)
docker run -p 3000:3000 mandao-backoffice:latest

# Si necesitas pasar otras variables de entorno (NO NEXT_PUBLIC_*), puedes hacerlo así:
docker run -p 3000:3000 \
  -e OTRA_VARIABLE=valor \
  mandao-backoffice:latest
```

### Notas sobre Variables de Entorno

- **Build-time variables (`NEXT_PUBLIC_*`):** 
  - ✅ Deben pasarse con `--build-arg` durante `docker build`
  - ✅ El Dockerfile las lee automáticamente de los `ARG` que pases
  - ❌ **NO funcionan** si las pasas con `-e` o `--env-file` durante `docker run`
  - ⚠️ Si no las pasas, se usarán los valores por defecto (`http://localhost:3001` y `http://localhost:3000`)

- **Runtime variables (sin prefijo `NEXT_PUBLIC_`):** 
  - ✅ Pueden pasarse con `-e` o `--env-file` durante `docker run`
  - ✅ Útiles para configuraciones del servidor que no se exponen al cliente

**Si necesitas cambiar la URL de la API después de construir la imagen, tendrás que reconstruir la imagen con el nuevo valor.**

## Testing

El proyecto usa Jest y React Testing Library para tests unitarios. La cobertura mínima requerida es del 80%.

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests con cobertura
npm run test:coverage
```

## Arquitectura

El proyecto sigue principios de Clean Architecture adaptada:

- **Presentation:** Componentes React y páginas
- **Application:** Custom hooks y lógica de aplicación
- **Infrastructure:** Cliente API y adaptadores
- **Domain:** Tipos y constantes

## Multi-Tenancy

El sistema soporta múltiples tenants con aislamiento completo de datos. El `tenant_id` se obtiene automáticamente del JWT del usuario autenticado.

## Inmutabilidad en Órdenes

Las órdenes y sus relaciones son append-only (solo INSERT, nunca UPDATE ni DELETE). Todos los cambios generan nuevos registros para mantener un historial completo.

## Contribución

1. Crear una rama desde `main`
2. Implementar cambios siguiendo las convenciones del proyecto
3. Escribir tests para nuevas funcionalidades
4. Asegurar que todos los tests pasen
5. Crear un Pull Request

## Licencia

Proprietary - Todos los derechos reservados
