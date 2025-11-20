'use client';

import { useParams } from 'next/navigation';
import { useDeliveryRate } from '@/lib/hooks/use-delivery-rates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit } from 'lucide-react';
import { RoleGuard } from '@/components/auth/role-guard';
import { DeliveryRateForm } from '@/components/delivery-rates/delivery-rate-form';

export default function DeliveryRateDetailPage() {
  const params = useParams();
  const rateId = params.id as string;
  const { data: rate, isLoading, error } = useDeliveryRate(rateId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando detalles de la tarifa...</p>
        </div>
      </div>
    );
  }

  if (error || !rate) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">
              Error al cargar los detalles de la tarifa o tarifa no encontrada.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const vehicleTypeLabels: Record<string, string> = {
    MOTORCYCLE: 'Motocicleta',
    SEDAN: 'Sedán',
    MINI_VAN: 'Mini Van',
    PANEL: 'Panel',
    TRUCK: 'Camión',
    PICKUP: 'Pickup',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Tarifa - {vehicleTypeLabels[rate.vehicle_type] || rate.vehicle_type}
          </h1>
          {rate.zone && (
            <p className="text-muted-foreground mt-2">Zona: {rate.zone.name}</p>
          )}
        </div>
        <RoleGuard
          requiredPermission={{ resource: 'delivery-rates', action: 'update' }}
          allowedRoles={['OWNER', 'SUPERVISOR']}
        >
          <Link href={`/delivery-rates/${rate.id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Editar Tarifa
            </Button>
          </Link>
        </RoleGuard>
      </div>

      <DeliveryRateForm rateId={rateId} />
    </div>
  );
}

