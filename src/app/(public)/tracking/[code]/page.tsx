'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderStatusBadge } from '@/components/orders/order-status-badge';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/date';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function PublicTrackingPage() {
  const params = useParams();
  const initialCode = params.code as string;
  const [trackingCode, setTrackingCode] = useState(initialCode || '');
  const [searchCode, setSearchCode] = useState(initialCode || '');

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['public-order-tracking', searchCode],
    queryFn: async () => {
      const response = await apiClient.get(endpoints.orders.publicTracking(searchCode));
      return response.data.data;
    },
    enabled: !!searchCode,
  });

  const handleSearch = () => {
    if (trackingCode.trim()) {
      setSearchCode(trackingCode.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Rastreo de Orden</h1>
          <p className="text-muted-foreground mt-2">
            Ingresa tu código de seguimiento para ver el estado de tu orden
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Buscar Orden</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ingresa tu código de seguimiento"
                  className="pl-8"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={!trackingCode.trim()}>
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Buscando orden...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <p className="text-destructive">No se encontró una orden con ese código de seguimiento</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Verifica que hayas ingresado el código correctamente
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {order && !isLoading && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Orden {order.order_display_number}</CardTitle>
                <OrderStatusBadge status={order.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Código de Seguimiento</p>
                <p className="font-medium">{order.tracking_code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <OrderStatusBadge status={order.status} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <Badge variant="outline">{order.order_type}</Badge>
              </div>
              {order.estimated_delivery_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Fecha Estimada de Entrega</p>
                  <p className="font-medium">{formatDate(order.estimated_delivery_at)}</p>
                </div>
              )}
              {order.delivery_address && typeof order.delivery_address === 'object' && (
                <div>
                  <p className="text-sm text-muted-foreground">Dirección de Entrega</p>
                  <p className="font-medium">
                    {order.delivery_address.street}, {order.delivery_address.city}
                  </p>
                  {order.delivery_address.country && (
                    <p className="text-sm text-muted-foreground">{order.delivery_address.country}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

