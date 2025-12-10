/**
 * Definición de endpoints de la API
 * Basados en el swagger.json
 */

const API_BASE = '/api/v1';

export const endpoints = {
  // Auth
  auth: {
    login: `${API_BASE}/auth/login`,
    register: `${API_BASE}/auth/register`,
    verifyEmail: `${API_BASE}/auth/verify-email`,
    passwordResetRequest: `${API_BASE}/auth/password/reset-request`,
    passwordReset: `${API_BASE}/auth/password/reset`,
    refresh: `${API_BASE}/auth/refresh`,
  },
  // Users
  users: {
    list: `${API_BASE}/users`,
    create: `${API_BASE}/users`,
    get: (id: string) => `${API_BASE}/users/${id}`,
    update: (id: string) => `${API_BASE}/users/${id}`,
    delete: (id: string) => `${API_BASE}/users/${id}`,
  },
  // Tenants
  tenants: {
    list: `${API_BASE}/tenants`,
    create: `${API_BASE}/tenants`,
    get: (id: string) => `${API_BASE}/tenants/${id}`,
    update: (id: string) => `${API_BASE}/tenants/${id}`,
    delete: (id: string) => `${API_BASE}/tenants/${id}`,
  },
  // Orders
  orders: {
    list: `${API_BASE}/orders`,
    create: `${API_BASE}/orders`,
    createRetail: `${API_BASE}/orders/retail`,
    get: (id: string) => `${API_BASE}/orders/${id}`,
    update: (id: string) => `${API_BASE}/orders/${id}`,
    assignDriver: (id: string) => `${API_BASE}/orders/${id}/assign-driver`,
    changeBranch: (id: string) => `${API_BASE}/orders/${id}/change-branch`,
    modifyItems: (id: string) => `${API_BASE}/orders/${id}/modify-items`,
    cancel: (id: string) => `${API_BASE}/orders/${id}/cancel`,
    recalculateTotals: (id: string) => `${API_BASE}/orders/${id}/recalculate-totals`,
    deliveryProof: (id: string) => `${API_BASE}/orders/${id}/delivery-proof`,
    rating: (id: string) => `${API_BASE}/orders/${id}/rating`,
    publicTracking: (trackingCode: string) => `/api/public/orders/${trackingCode}`,
  },
  // Geocoding
  geocoding: {
    search: `${API_BASE}/geocoding/search`,
    reverse: `${API_BASE}/geocoding/reverse`,
  },
  // Drivers
  drivers: {
    list: `${API_BASE}/drivers`,
    create: `${API_BASE}/drivers`,
    get: (id: string) => `${API_BASE}/drivers/${id}`,
    update: (id: string) => `${API_BASE}/drivers/${id}`,
    delete: (id: string) => `${API_BASE}/drivers/${id}`,
  },
  // Vehicles
  vehicles: {
    list: `${API_BASE}/vehicles`,
    create: `${API_BASE}/vehicles`,
    get: (id: string) => `${API_BASE}/vehicles/${id}`,
    update: (id: string) => `${API_BASE}/vehicles/${id}`,
    delete: (id: string) => `${API_BASE}/vehicles/${id}`,
  },
  // Branches
  branches: {
    list: `${API_BASE}/branches`,
    create: `${API_BASE}/branches`,
    get: (id: string) => `${API_BASE}/branches/${id}`,
    update: (id: string) => `${API_BASE}/branches/${id}`,
    delete: (id: string) => `${API_BASE}/branches/${id}`,
  },
  // Products
  products: {
    list: `${API_BASE}/products`,
    create: `${API_BASE}/products`,
    get: (id: string) => `${API_BASE}/products/${id}`,
    update: (id: string) => `${API_BASE}/products/${id}`,
    delete: (id: string) => `${API_BASE}/products/${id}`,
  },
  // Product Variants
  productVariants: {
    list: `${API_BASE}/product-variants`,
    create: `${API_BASE}/product-variants`,
    get: (id: string) => `${API_BASE}/product-variants/${id}`,
    update: (id: string) => `${API_BASE}/product-variants/${id}`,
    delete: (id: string) => `${API_BASE}/product-variants/${id}`,
  },
  // Categories
  categories: {
    list: `${API_BASE}/categories`,
    create: `${API_BASE}/categories`,
    get: (id: string) => `${API_BASE}/categories/${id}`,
    update: (id: string) => `${API_BASE}/categories/${id}`,
    delete: (id: string) => `${API_BASE}/categories/${id}`,
  },
  // Brands
  brands: {
    list: `${API_BASE}/brands`,
    create: `${API_BASE}/brands`,
    get: (id: string) => `${API_BASE}/brands/${id}`,
    update: (id: string) => `${API_BASE}/brands/${id}`,
    delete: (id: string) => `${API_BASE}/brands/${id}`,
  },
  // Reports
  reports: {
    dashboardKPIs: `${API_BASE}/reports/dashboard/kpis`,
    orders: `${API_BASE}/reports/orders`,
    ordersExport: `${API_BASE}/reports/orders/export`,
    inventory: `${API_BASE}/reports/inventory`,
    drivers: `${API_BASE}/reports/drivers`,
  },
  // Payments
  payments: {
    transactions: `${API_BASE}/payments/transactions`,
    orderPayments: (orderId: string) => `${API_BASE}/payments/orders/${orderId}/payments`,
    refunds: `${API_BASE}/payments/refunds`,
    checkout: `${API_BASE}/payments/checkout`,
  },
  // Subscriptions
  subscriptions: {
    changePlan: `${API_BASE}/subscriptions/change-plan`,
    startTrial: `${API_BASE}/subscriptions/start-trial`,
    convertTrial: `${API_BASE}/subscriptions/convert-trial`,
    limits: `${API_BASE}/subscriptions/limits`,
  },
  // Subscription Plans
  subscriptionPlans: {
    list: `${API_BASE}/subscription-plans`,
    create: `${API_BASE}/subscription-plans`,
    get: (id: string) => `${API_BASE}/subscription-plans/${id}`,
    update: (id: string) => `${API_BASE}/subscription-plans/${id}`,
    delete: (id: string) => `${API_BASE}/subscription-plans/${id}`,
  },
  // Order Counters
  orderCounters: {
    getByTenant: (tenantId: string) => `${API_BASE}/order-counters/tenant/${tenantId}`,
    update: (tenantId: string) => `${API_BASE}/order-counters/tenant/${tenantId}`,
    create: `${API_BASE}/order-counters`,
    increment: (tenantId: string) => `${API_BASE}/order-counters/tenant/${tenantId}/increment`,
  },
  // Delivery Zones
  deliveryZones: {
    list: `${API_BASE}/delivery-zones`,
    create: `${API_BASE}/delivery-zones`,
    get: (id: string) => `${API_BASE}/delivery-zones/${id}`,
    update: (id: string) => `${API_BASE}/delivery-zones/${id}`,
    delete: (id: string) => `${API_BASE}/delivery-zones/${id}`,
  },
  // Delivery Rates
  deliveryRates: {
    list: `${API_BASE}/delivery-rates`,
    create: `${API_BASE}/delivery-rates`,
    get: (id: string) => `${API_BASE}/delivery-rates/${id}`,
    update: (id: string) => `${API_BASE}/delivery-rates/${id}`,
    delete: (id: string) => `${API_BASE}/delivery-rates/${id}`,
  },
  // Logistics Providers
  logisticsProviders: {
    list: `${API_BASE}/logistics-providers`,
    create: `${API_BASE}/logistics-providers`,
    get: (id: string) => `${API_BASE}/logistics-providers/${id}`,
    update: (id: string) => `${API_BASE}/logistics-providers/${id}`,
    delete: (id: string) => `${API_BASE}/logistics-providers/${id}`,
  },
  // Storefront
  storefront: {
    config: `${API_BASE}/storefront/config`,
    update: `${API_BASE}/storefront`,
  },
} as const;

