# Multi-stage build para optimizar tamaño de imagen
FROM node:20-alpine AS base

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache libc6-compat

# Instalar pnpm (opcional, más rápido que npm)
# RUN npm install -g pnpm

WORKDIR /app

# ============================================
# Stage 1: Dependencies
# ============================================
FROM base AS deps

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias (incluyendo devDependencies para build)
# Intentar npm ci primero, si falla usar npm install (para manejar lock files desincronizados)
RUN if [ -f package-lock.json ]; then \
      echo "📦 Intentando usar package-lock.json..." && \
      (npm ci || (echo "⚠️  package-lock.json desincronizado, usando npm install" && npm install)); \
    else \
      echo "⚠️  package-lock.json no encontrado, usando npm install" && \
      npm install; \
    fi

# ============================================
# Stage 2: Builder
# ============================================
FROM base AS builder

# Copiar dependencias instaladas
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente y archivos de configuración
COPY . .

# ARG para recibir variables en tiempo de build
# IMPORTANTE: Las variables NEXT_PUBLIC_* se inyectan en BUILD TIME, no en runtime
# Debes pasarlas con --build-arg al construir la imagen
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000

# Convertir ARG a ENV para que Next.js las use durante el build
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Construir la aplicación Next.js
# El modo standalone genera una versión optimizada para producción
RUN npm run build

# ============================================
# Stage 3: Runner (Producción)
# ============================================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar archivos necesarios desde el builder
# Next.js standalone incluye solo las dependencias necesarias
# Nota: Next.js standalone automáticamente incluye el directorio public si existe
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambiar al usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
# Verifica que el servidor Next.js responda correctamente
# Puedes crear un endpoint /api/health si lo necesitas
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode >= 200 && r.statusCode < 400 ? 0 : 1)})"

# Comando de inicio
# Next.js standalone ejecuta el servidor directamente
CMD ["node", "server.js"]

