/**
 * Definición de roles y permisos del sistema
 * Según el plan: OWNER, SUPERVISOR, MERCHANT_USER, CUSTOMER
 * También incluye roles de SaaS: SAAS_ADMIN, SAAS_EDITOR
 */

export type UserRole = 'OWNER' | 'SUPERVISOR' | 'MERCHANT_USER' | 'LOGISTICS_PROVIDER' | 'DRIVER' | 'CUSTOMER' | 'SAAS_ADMIN' | 'SAAS_EDITOR';

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

/**
 * Matriz de permisos por módulo y rol
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SAAS_ADMIN: [
    // Acceso total a todo para administradores del SaaS
    { resource: '*', action: 'manage' },
  ],
  SAAS_EDITOR: [
    // Acceso total a todo para editores del SaaS
    { resource: '*', action: 'manage' },
  ],
  OWNER: [
    // Acceso total a todo
    { resource: '*', action: 'manage' },
  ],
  SUPERVISOR: [
    // Dashboard
    { resource: 'dashboard', action: 'read' },
    // Órdenes (solo read y update - no puede crear ni eliminar)
    { resource: 'orders', action: 'read' },
    { resource: 'orders', action: 'update' },
    // Drivers
    { resource: 'drivers', action: 'read' },
    { resource: 'drivers', action: 'create' },
    { resource: 'drivers', action: 'update' },
    { resource: 'drivers', action: 'delete' },
    // Vehículos
    { resource: 'vehicles', action: 'read' },
    { resource: 'vehicles', action: 'create' },
    { resource: 'vehicles', action: 'update' },
    { resource: 'vehicles', action: 'delete' },
    // Delivery Zones/Rates
    { resource: 'delivery-zones', action: 'read' },
    { resource: 'delivery-zones', action: 'create' },
    { resource: 'delivery-zones', action: 'update' },
    { resource: 'delivery-zones', action: 'delete' },
    { resource: 'delivery-rates', action: 'read' },
    { resource: 'delivery-rates', action: 'create' },
    { resource: 'delivery-rates', action: 'update' },
    { resource: 'delivery-rates', action: 'delete' },
    // Logistics Providers (solo el suyo)
    { resource: 'logistics-providers', action: 'read' },
    // Usuarios (solo read y update - no puede crear)
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'update' },
    // Reportes
    { resource: 'reports', action: 'read' },
  ],
  MERCHANT_USER: [
    // Dashboard
    { resource: 'dashboard', action: 'read' },
    // Órdenes (acceso completo en RETAIL, solo órdenes en ON_DEMAND)
    { resource: 'orders', action: 'read' },
    { resource: 'orders', action: 'create' },
    { resource: 'orders', action: 'update' },
    { resource: 'orders', action: 'delete' },
    // Productos (solo RETAIL)
    { resource: 'products', action: 'read' },
    { resource: 'products', action: 'create' },
    { resource: 'products', action: 'update' },
    { resource: 'products', action: 'delete' },
    // Categorías (solo RETAIL)
    { resource: 'categories', action: 'read' },
    { resource: 'categories', action: 'create' },
    { resource: 'categories', action: 'update' },
    { resource: 'categories', action: 'delete' },
    // Marcas (solo RETAIL)
    { resource: 'brands', action: 'read' },
    { resource: 'brands', action: 'create' },
    { resource: 'brands', action: 'update' },
    { resource: 'brands', action: 'delete' },
    // Sucursales (solo RETAIL)
    { resource: 'branches', action: 'read' },
    { resource: 'branches', action: 'create' },
    { resource: 'branches', action: 'update' },
    { resource: 'branches', action: 'delete' },
    // Unidades de Medida (solo RETAIL)
    { resource: 'units-of-measure', action: 'read' },
    { resource: 'units-of-measure', action: 'create' },
    { resource: 'units-of-measure', action: 'update' },
    { resource: 'units-of-measure', action: 'delete' },
    // Reportes (solo sus datos)
    { resource: 'reports', action: 'read' },
  ],
  LOGISTICS_PROVIDER: [
    // Dashboard (solo métricas de sus órdenes)
    { resource: 'dashboard', action: 'read' },
    // Órdenes (solo órdenes asignadas a su proveedor)
    { resource: 'orders', action: 'read' },
    { resource: 'orders', action: 'update' },
    // Drivers (solo de su proveedor)
    { resource: 'drivers', action: 'read' },
    { resource: 'drivers', action: 'create' },
    { resource: 'drivers', action: 'update' },
    { resource: 'drivers', action: 'delete' },
    // Vehículos (solo de su proveedor)
    { resource: 'vehicles', action: 'read' },
    { resource: 'vehicles', action: 'create' },
    { resource: 'vehicles', action: 'update' },
    { resource: 'vehicles', action: 'delete' },
    // Delivery Zones/Rates
    { resource: 'delivery-zones', action: 'read' },
    { resource: 'delivery-zones', action: 'create' },
    { resource: 'delivery-zones', action: 'update' },
    { resource: 'delivery-zones', action: 'delete' },
    { resource: 'delivery-rates', action: 'read' },
    { resource: 'delivery-rates', action: 'create' },
    { resource: 'delivery-rates', action: 'update' },
    { resource: 'delivery-rates', action: 'delete' },
    // Logistics Providers (solo el suyo)
    { resource: 'logistics-providers', action: 'read' },
    // Usuarios (solo usuarios de su proveedor - solo puede crear SUPERVISOR)
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'create' },
    { resource: 'users', action: 'update' },
    // Reportes (solo de sus datos)
    { resource: 'reports', action: 'read' },
  ],
  DRIVER: [
    // DRIVER no tiene permisos en el backoffice - solo acceso al link de rastreo público
  ],
  CUSTOMER: [
    // Solo lectura de órdenes propias (solo para storefront, no backoffice)
    { resource: 'orders', action: 'read' }, // Solo propias
    // Rating
    { resource: 'orders', action: 'update' }, // Solo para rating
  ],
};

/**
 * Verifica si un rol tiene un permiso específico
 */
export function hasPermission(role: UserRole, resource: string, action: Permission['action']): boolean {
  // SAAS_ADMIN y SAAS_EDITOR tienen acceso a todo
  if (role === 'SAAS_ADMIN' || role === 'SAAS_EDITOR') {
    return true;
  }

  const permissions = ROLE_PERMISSIONS[role];

  // OWNER tiene acceso a todo EXCEPTO módulos SAAS
  if (role === 'OWNER') {
    // Si es un módulo SAAS, no permitir acceso automático
    if (
      resource === 'order-counters' ||
      resource === 'payments' ||
      resource === 'subscriptions' ||
      resource === 'subscription-plans'
    ) {
      return false;
    }
    return true;
  }

  // Verificar permiso específico
  const hasSpecificPermission = permissions.some(
    (p) => (p.resource === resource || p.resource === '*') && (p.action === action || p.action === 'manage')
  );

  return hasSpecificPermission;
}

/**
 * Verifica si un rol puede acceder a un recurso (cualquier acción)
 */
export function canAccessResource(role: UserRole, resource: string): boolean {
  // SAAS_ADMIN y SAAS_EDITOR tienen acceso a todo
  if (role === 'SAAS_ADMIN' || role === 'SAAS_EDITOR') {
    return true;
  }

  // OWNER tiene acceso a todo EXCEPTO módulos SAAS
  if (role === 'OWNER') {
    if (
      resource === 'order-counters' ||
      resource === 'payments' ||
      resource === 'subscriptions' ||
      resource === 'subscription-plans'
    ) {
      return false;
    }
    return true;
  }

  return ROLE_PERMISSIONS[role].some((p) => p.resource === resource || p.resource === '*');
}

/**
 * Obtiene todas las acciones permitidas para un recurso y rol
 */
export function getAllowedActions(role: UserRole, resource: string): Permission['action'][] {
  // SAAS_ADMIN y SAAS_EDITOR tienen acceso a todo
  if (role === 'SAAS_ADMIN' || role === 'SAAS_EDITOR') {
    return ['create', 'read', 'update', 'delete', 'manage'];
  }

  // OWNER tiene acceso a todo EXCEPTO módulos SAAS
  if (role === 'OWNER') {
    if (
      resource === 'order-counters' ||
      resource === 'payments' ||
      resource === 'subscriptions' ||
      resource === 'subscription-plans'
    ) {
      return [];
    }
    return ['create', 'read', 'update', 'delete', 'manage'];
  }

  const permissions = ROLE_PERMISSIONS[role].filter((p) => p.resource === resource || p.resource === '*');
  const actions = new Set<Permission['action']>();

  permissions.forEach((p) => {
    if (p.action === 'manage') {
      actions.add('create');
      actions.add('read');
      actions.add('update');
      actions.add('delete');
      actions.add('manage');
    } else {
      actions.add(p.action);
    }
  });

  return Array.from(actions);
}

