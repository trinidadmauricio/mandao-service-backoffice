'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { DriverCard } from './driver-card';
import { useAvailableDrivers } from '@/lib/hooks/use-drivers';
import { useDriverLocations } from '@/lib/hooks/use-driver-locations';
import { isVehicleCompatibleWithCargo } from '@/lib/utils/vehicle-compatibility';
import { Truck, Search, Wifi, WifiOff } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/use-debounce';

interface DriversAvailablePanelProps {
  logisticsProviderId?: string;
  selectedOrderId?: string;
  orderCargoSize?: 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE';
  orderLat?: number;
  orderLng?: number;
  onAssignDriver?: (driverId: string) => void;
  isAssigning?: boolean;
}

export function DriversAvailablePanel({
  logisticsProviderId,
  selectedOrderId,
  orderCargoSize,
  orderLat,
  orderLng,
  onAssignDriver,
  isAssigning = false,
}: DriversAvailablePanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Obtener drivers disponibles
  const { data: availableDrivers = [], isLoading } = useAvailableDrivers({
    logistics_provider_id: logisticsProviderId,
    cargo_size: orderCargoSize,
    order_lat: orderLat,
    order_lng: orderLng,
  });

  // Obtener IDs de drivers para suscripción WebSocket
  const driverIds = useMemo(
    () => availableDrivers.map((driver) => driver.id),
    [availableDrivers]
  );

  // Suscribirse a ubicaciones de todos los drivers disponibles
  const { locations, isConnected: isWsConnected } = useDriverLocations({
    driverIds,
    enabled: driverIds.length > 0,
    autoConnect: true,
  });

  // Filtrar drivers por búsqueda y calcular compatibilidad
  const filteredDrivers = useMemo(() => {
    let drivers = availableDrivers;

    // Filtrar por búsqueda
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      drivers = drivers.filter(
        (driver) =>
          driver.user.first_name.toLowerCase().includes(search) ||
          driver.user.last_name.toLowerCase().includes(search) ||
          driver.user.email.toLowerCase().includes(search) ||
          (driver.vehicle_license_plate?.toLowerCase().includes(search) ?? false)
      );
    }

    // Agregar flag de compatibilidad
    return drivers.map((driver) => {
      const compatible =
        !orderCargoSize ||
        !driver.vehicle_type ||
        isVehicleCompatibleWithCargo(driver.vehicle_type, orderCargoSize);
      return { ...driver, isCompatible: compatible };
    });
  }, [availableDrivers, debouncedSearch, orderCargoSize]);

  // Separar drivers por compatibilidad y capacidad
  const compatibleDrivers = filteredDrivers.filter(
    (d) => d.isCompatible && d.active_orders_count < d.max_orders
  );
  const incompatibleDrivers = filteredDrivers.filter((d) => !d.isCompatible);
  const atCapacityDrivers = filteredDrivers.filter(
    (d) => d.isCompatible && d.active_orders_count >= d.max_orders
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Drivers Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Drivers Disponibles
            {availableDrivers.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {availableDrivers.length}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isWsConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground">
              {isWsConnected ? 'En línea' : 'Desconectado'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Búsqueda */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar driver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {filteredDrivers.length === 0 ? (
          <EmptyState
            variant="empty"
            title="No hay drivers disponibles"
            description={
              availableDrivers.length === 0
                ? 'No hay drivers disponibles para asignar.'
                : 'No se encontraron drivers que coincidan con la búsqueda.'
            }
            className="py-8"
          />
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {/* Drivers compatibles y con capacidad */}
            {compatibleDrivers.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                  Compatibles ({compatibleDrivers.length})
                </h4>
                <div className="space-y-2">
                  {compatibleDrivers.map((driver) => (
                    <DriverCard
                      key={driver.id}
                      driver={driver}
                      location={locations.get(driver.id)}
                      onAssign={onAssignDriver}
                      isAssigning={isAssigning}
                      selectedOrderId={selectedOrderId}
                      isCompatible={driver.isCompatible}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Drivers en capacidad máxima */}
            {atCapacityDrivers.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                  En Capacidad Máxima ({atCapacityDrivers.length})
                </h4>
                <div className="space-y-2">
                  {atCapacityDrivers.map((driver) => (
                    <DriverCard
                      key={driver.id}
                      driver={driver}
                      location={locations.get(driver.id)}
                      onAssign={onAssignDriver}
                      isAssigning={isAssigning}
                      selectedOrderId={selectedOrderId}
                      isCompatible={driver.isCompatible}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Drivers incompatibles */}
            {incompatibleDrivers.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                  Incompatibles ({incompatibleDrivers.length})
                </h4>
                <div className="space-y-2">
                  {incompatibleDrivers.map((driver) => (
                    <DriverCard
                      key={driver.id}
                      driver={driver}
                      location={locations.get(driver.id)}
                      onAssign={onAssignDriver}
                      isAssigning={isAssigning}
                      selectedOrderId={selectedOrderId}
                      isCompatible={driver.isCompatible}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

