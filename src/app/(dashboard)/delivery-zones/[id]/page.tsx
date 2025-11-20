'use client';

import { useParams } from 'next/navigation';
import { useDeliveryZone } from '@/lib/hooks/use-delivery-zones';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit } from 'lucide-react';
import { RoleGuard } from '@/components/auth/role-guard';
import { DeliveryZoneForm } from '@/components/delivery-zones/delivery-zone-form';

export default function DeliveryZoneDetailPage() {
  const params = useParams();
  const zoneId = params.id as string;
  const { data: zone, isLoading, error } = useDeliveryZone(zoneId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando detalles de la zona...</p>
        </div>
      </div>
    );
  }

  if (error || !zone) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">
              Error al cargar los detalles de la zona o zona no encontrada.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{zone.name}</h1>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant={zone.is_active ? 'default' : 'outline'}>
              {zone.is_active ? 'Activa' : 'Inactiva'}
            </Badge>
          </div>
        </div>
        <RoleGuard
          requiredPermission={{ resource: 'delivery-zones', action: 'update' }}
          allowedRoles={['OWNER', 'SUPERVISOR']}
        >
          <Link href={`/delivery-zones/${zone.id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Editar Zona
            </Button>
          </Link>
        </RoleGuard>
      </div>

      <DeliveryZoneForm zoneId={zoneId} />
    </div>
  );
}

