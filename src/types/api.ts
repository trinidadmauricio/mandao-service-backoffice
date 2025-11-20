/**
 * Tipos TypeScript para las respuestas de la API
 * Basados en el swagger.json
 */

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    email_verified: boolean;
    tenant_id?: string | null;
    logistics_provider_id?: string | null;
  };
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'OWNER' | 'SUPERVISOR' | 'MERCHANT_USER' | 'LOGISTICS_PROVIDER' | 'CUSTOMER' | 'SAAS_ADMIN' | 'SAAS_EDITOR';
  tenant_id?: string | null; // Opcional para usuarios SAAS_ADMIN que no tienen tenant
  logistics_provider_id?: string | null; // Opcional para usuarios LOGISTICS_PROVIDER
  email_verified: boolean;
  active?: boolean; // Opcional, puede no venir en la respuesta del login
  created_at?: string; // Opcional, puede no venir en la respuesta del login
  updated_at?: string; // Opcional, puede no venir en la respuesta del login
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  type: 'RETAIL' | 'ON_DEMAND' | 'HYBRID';
  subscription_plan_id?: string;
  subscription_status: 'TRIAL' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  subscription_expires_at?: string;
  default_locale: string;
  default_currency: string;
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  tenant_id: string;
  order_number: string;
  order_display_number: string;
  order_type: 'RETAIL' | 'ON_DEMAND';
  customer_id?: string;
  customer_snapshot: Record<string, unknown>;
  delivery_address: Record<string, unknown>;
  delivery_lat: number;
  delivery_lng: number;
  pickup_address?: Record<string, unknown>;
  pickup_lat?: number;
  pickup_lng?: number;
  status: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'FAILED';
  scheduled_pickup_at?: string;
  estimated_delivery_at: string;
  special_instructions?: string;
  priority: 'NORMAL' | 'URGENT';
  cargo_description?: string;
  tracking_code: string;
  created_at: string;
  updated_at: string;
  // Historial (populated)
  order_drivers?: Array<{
    id: string;
    driver_snapshot: Record<string, unknown>;
    is_current: boolean;
    created_at: string;
  }>;
  order_branches?: Array<{
    id: string;
    branch_snapshot: Record<string, unknown>;
    is_current: boolean;
    created_at: string;
  }>;
  order_items?: Array<{
    id: string;
    product_snapshot: Record<string, unknown>;
    quantity: number | string;
    unit_price: number | string;
    notes?: string;
    created_at: string;
  }>;
  order_summary_totals?: Array<{
    id: string;
    version: number;
    subtotal: number | string;
    tax_rate: number | string;
    tax_amount: number | string;
    delivery_fee: number | string;
    discount_amount: number | string;
    total_amount: number | string;
    currency: string;
    is_current: boolean;
    created_at: string;
  }>;
  order_status_history?: Array<{
    id: string;
    from_status: string | null;
    to_status: string;
    notes?: string;
    created_at: string;
  }>;
}

export interface LogisticsProvider {
  id: string;
  tenant_id?: string;
  company_name: string;
  tax_id: string;
  representative_name: string;
  representative_phone: string;
  representative_document: string;
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verification_documents?: Record<string, unknown>;
  rating_avg?: number;
  total_deliveries: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  logistics_provider_id: string;
  user_id: string;
  identity_document: string;
  driving_license: string;
  date_of_birth: string;
  emergency_contact: Record<string, unknown>;
  has_own_vehicle: boolean;
  vehicle_id?: string;
  work_type: 'FULL_TIME' | 'PART_TIME' | 'FREELANCE';
  work_zone?: string;
  availability_status: 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'SUSPENDED';
  rating_avg?: number;
  total_deliveries: number;
  documents: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Campos relacionados (populated)
  user?: User;
  vehicle?: Vehicle;
  logistics_provider?: LogisticsProvider;
}

export interface Vehicle {
  id: string;
  logistics_provider_id?: string;
  driver_id?: string;
  vehicle_type: 'MOTORCYCLE' | 'SEDAN' | 'MINI_VAN' | 'PANEL' | 'TRUCK' | 'PICKUP';
  license_plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  insurance_policy: string;
  insurance_expires_at: string;
  last_maintenance_at?: string;
  status: 'AVAILABLE' | 'IN_SERVICE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  specifications?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Campos relacionados (populated)
  driver?: Driver;
  logistics_provider?: LogisticsProvider;
}

export interface Branch {
  id: string;
  tenant_id: string;
  name: string;
  address: string;
  gps_lat: number;
  gps_lng: number;
  contact_phone: string;
  is_main: boolean;
  operating_hours?: Record<string, unknown>;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export interface DeliveryZone {
  id: string;
  tenant_id: string;
  name: string;
  boundary: string; // WKT format
  base_rate: number;
  rate_per_km: number;
  surge_multiplier?: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryRate {
  id: string;
  tenant_id: string;
  zone_id?: string;
  vehicle_type: 'MOTORCYCLE' | 'SEDAN' | 'MINI_VAN' | 'PANEL' | 'TRUCK' | 'PICKUP';
  distance_km_min: number;
  distance_km_max: number;
  base_price: number;
  price_per_km: number;
  currency: string;
  priority_multiplier: Record<string, number>;
  created_at: string;
  updated_at: string;
  // Campos relacionados (populated)
  zone?: DeliveryZone;
}

export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  sku?: string;
  status: 'active' | 'inactive' | 'draft';
  category_id?: string;
  brand_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardKPIs {
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  active_drivers: number;
}
