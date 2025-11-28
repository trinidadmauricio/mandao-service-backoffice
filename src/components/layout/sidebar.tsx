"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { useTenant } from "@/lib/hooks/use-tenant";
import { USER_ROLE } from "@/lib/constants/roles";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  Package,
  Truck,
  Users,
  Settings,
  CreditCard,
  BarChart3,
  MapPin,
  Car,
  Tags,
  Award,
  Navigation,
  DollarSign,
  Crown,
  Ruler,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredPermission?: {
    resource: string;
    action: "read" | "create" | "update" | "delete" | "manage";
  };
  allowedRoles?: string[];
  requiredTenantType?: "RETAIL" | "ON_DEMAND"; // Si no se especifica, está disponible para todos los tenant types
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    requiredPermission: { resource: "dashboard", action: "read" },
  },
  {
    title: "Órdenes",
    href: "/orders",
    icon: Package,
    requiredPermission: { resource: "orders", action: "read" },
  },
  {
    title: "Productos",
    href: "/products",
    icon: Package,
    requiredPermission: { resource: "products", action: "read" },
    requiredTenantType: "RETAIL",
  },
  {
    title: "Categorías",
    href: "/categories",
    icon: Tags,
    requiredPermission: { resource: "categories", action: "read" },
    requiredTenantType: "RETAIL",
  },
  {
    title: "Marcas",
    href: "/brands",
    icon: Award,
    requiredPermission: { resource: "brands", action: "read" },
    requiredTenantType: "RETAIL",
  },
  {
    title: "Drivers",
    href: "/drivers",
    icon: Truck,
    requiredPermission: { resource: "drivers", action: "read" },
    allowedRoles: ["SUPERVISOR", "LOGISTICS_PROVIDER"],
  },
  {
    title: "Vehículos",
    href: "/vehicles",
    icon: Car,
    requiredPermission: { resource: "vehicles", action: "read" },
    allowedRoles: ["SUPERVISOR", "LOGISTICS_PROVIDER"],
  },
  {
    title: "Sucursales",
    href: "/branches",
    icon: MapPin,
    requiredPermission: { resource: "branches", action: "read" },
    allowedRoles: ["OWNER", "SUPERVISOR"],
    requiredTenantType: "RETAIL",
  },
  {
    title: "Unidades de Medida",
    href: "/units-of-measure",
    icon: Ruler,
    requiredPermission: { resource: "units-of-measure", action: "read" },
    requiredTenantType: "RETAIL",
  },
  {
    title: "Zonas de Entrega",
    href: "/delivery-zones",
    icon: Navigation,
    requiredPermission: { resource: "delivery-zones", action: "read" },
    allowedRoles: ["SUPERVISOR", "LOGISTICS_PROVIDER"],
  },
  {
    title: "Tarifas de Entrega",
    href: "/delivery-rates",
    icon: DollarSign,
    requiredPermission: { resource: "delivery-rates", action: "read" },
    allowedRoles: ["SUPERVISOR", "LOGISTICS_PROVIDER"],
  },
  {
    title: "Usuarios",
    href: "/users",
    icon: Users,
    requiredPermission: { resource: "users", action: "read" },
    allowedRoles: ["OWNER", "SUPERVISOR", "LOGISTICS_PROVIDER"],
  },
  {
    title: "Pagos",
    href: "/payments/transactions",
    icon: CreditCard,
    requiredPermission: { resource: "payments", action: "read" },
    allowedRoles: ["SAAS_ADMIN", "SAAS_EDITOR"],
  },
  {
    title: "Suscripción",
    href: "/subscriptions",
    icon: Crown,
    requiredPermission: { resource: "subscriptions", action: "read" },
    allowedRoles: ["SAAS_ADMIN", "SAAS_EDITOR"],
  },
  {
    title: "Reportes",
    href: "/reports",
    icon: BarChart3,
    requiredPermission: { resource: "reports", action: "read" },
  },
  {
    title: "Proveedores",
    href: "/logistics-providers",
    icon: Truck,
    requiredPermission: { resource: "logistics-providers", action: "read" },
    allowedRoles: [
      "SUPERVISOR",
      "LOGISTICS_PROVIDER",
      "SAAS_ADMIN",
      "SAAS_EDITOR",
    ],
  },
  {
    title: "Configuración",
    href: "/settings",
    icon: Settings,
    requiredPermission: { resource: "tenants", action: "update" },
    allowedRoles: ["OWNER"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { hasPermission, role } = usePermissions();
  const { tenant, isRetail, isOnDemand } = useTenant();

  const filteredNavItems = navItems.filter((item) => {
    // Excluir CUSTOMER del backoffice (solo para storefront)
    if (role === USER_ROLE.CUSTOMER) {
      return false;
    }

    // Validar tenant type
    if (item.requiredTenantType) {
      // SAAS roles pueden ver todo sin restricciones de tenant type
      if (role === USER_ROLE.SAAS_ADMIN || role === USER_ROLE.SAAS_EDITOR) {
        // Permitir acceso
      }
      // LOGISTICS_PROVIDER y SUPERVISOR no tienen tenant, no deben ver módulos de catálogo
      else if (role === USER_ROLE.LOGISTICS_PROVIDER || role === USER_ROLE.SUPERVISOR) {
        // Si requiere RETAIL, no mostrar (LOGISTICS_PROVIDER no tiene catálogo)
        if (item.requiredTenantType === "RETAIL") {
          return false;
        }
      }
      // Otros roles: validar tenant type
      else if (tenant) {
        if (item.requiredTenantType === "RETAIL" && !isRetail) {
          return false;
        }
        if (item.requiredTenantType === "ON_DEMAND" && !isOnDemand) {
          return false;
        }
      } else {
        // Si no hay tenant y requiere un tipo específico, no mostrar
        return false;
      }
    }

    // Validar roles permitidos
    if (item.allowedRoles && role && !item.allowedRoles.includes(role)) {
      return false;
    }

    // Validar permisos
    if (item.requiredPermission) {
      return hasPermission(
        item.requiredPermission.resource,
        item.requiredPermission.action
      );
    }

    return true;
  });

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-14">
      <div className="flex-1 flex flex-col overflow-y-auto border-r bg-background">
        <nav className="flex-1 px-3 py-4 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 relative",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:translate-x-1"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-r-full" />
                )}
                <Icon
                  className={cn(
                    "mr-3 h-6 w-6 flex-shrink-0",
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
