'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrdersReportPage } from '@/components/reports/orders-report-page';
import { InventoryReportPage } from '@/components/reports/inventory-report-page';
import { DriversReportPage } from '@/components/reports/drivers-report-page';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { FileText, Package, Truck } from 'lucide-react';

export default function ReportsPage() {
  return (
    <PermissionGuard
      resource="reports"
      action="read"
      fallback={<div>No tienes permisos para acceder a esta página</div>}
    >
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reportes</h1>
        <p className="text-muted-foreground mt-2">
          Visualiza y analiza los datos de tu operación
        </p>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">
            <FileText className="h-4 w-4 mr-2" />
            Órdenes
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Package className="h-4 w-4 mr-2" />
            Inventario
          </TabsTrigger>
          <TabsTrigger value="drivers">
            <Truck className="h-4 w-4 mr-2" />
            Drivers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <OrdersReportPage />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryReportPage />
        </TabsContent>

        <TabsContent value="drivers">
          <DriversReportPage />
        </TabsContent>
      </Tabs>
    </div>
    </PermissionGuard>
  );
}
