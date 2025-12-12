'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Truck, Star, Package, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { AvailableDriver } from '@/lib/hooks/use-drivers';
import type { DriverLocationState } from '@/lib/hooks/use-driver-locations';

interface DriverCardProps {
  driver: AvailableDriver;
  location?: DriverLocationState | null;
  onAssign?: (driverId: string) => void;
  isAssigning?: boolean;
  selectedOrderId?: string;
  isCompatible?: boolean;
}

export function DriverCard({
  driver,
  location,
  onAssign,
  isAssigning = false,
  selectedOrderId,
  isCompatible = true,
}: DriverCardProps) {
  const isOnline = location?.isOnline ?? false;
  const hasLocation = location?.location !== null;

  // Calcular capacidad disponible
  const capacityPercentage = (driver.active_orders_count / driver.max_orders) * 100;
  const isNearCapacity = capacityPercentage >= 80;
  const isAtCapacity = driver.active_orders_count >= driver.max_orders;

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        !isCompatible && 'opacity-60',
        isAtCapacity && 'border-destructive/50'
      )}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header: Nombre y estado */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">
                  {driver.user.first_name} {driver.user.last_name}
                </h3>
                {isOnline && hasLocation ? (
                  <Wifi className="h-3 w-3 text-green-500" />
                ) : (
                  <WifiOff className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {driver.user.email}
              </p>
            </div>
            <Badge
              variant={
                driver.availability_status === 'AVAILABLE'
                  ? 'default'
                  : driver.availability_status === 'BUSY'
                  ? 'secondary'
                  : 'outline'
              }
              className="text-xs"
            >
              {driver.availability_status === 'AVAILABLE'
                ? 'Disponible'
                : driver.availability_status === 'BUSY'
                ? 'En ruta'
                : driver.availability_status}
            </Badge>
          </div>

          {/* Información del vehículo */}
          {driver.vehicle_type && driver.vehicle_license_plate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Truck className="h-3 w-3" />
              <span>
                {driver.vehicle_type} - {driver.vehicle_license_plate}
              </span>
              {!isCompatible && (
                <Badge variant="outline" className="ml-auto text-xs">
                  Incompatible
                </Badge>
              )}
            </div>
          )}

          {/* Ubicación */}
          {hasLocation && location?.location && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>
                {location.location.lat.toFixed(6)}, {location.location.lng.toFixed(6)}
              </span>
              {driver.distance_km !== undefined && (
                <span className="ml-auto font-medium">
                  {driver.distance_km.toFixed(1)} km
                </span>
              )}
            </div>
          )}

          {/* Capacidad y rating */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Package className="h-3 w-3 text-muted-foreground" />
                <span className={cn(isNearCapacity && 'font-semibold', isAtCapacity && 'text-destructive')}>
                  {driver.active_orders_count}/{driver.max_orders} órdenes
                </span>
              </div>
              {driver.rating_avg && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{driver.rating_avg.toFixed(1)}</span>
                </div>
              )}
            </div>
            <span className="text-muted-foreground">
              {driver.total_deliveries} entregas
            </span>
          </div>

          {/* Barra de capacidad */}
          <div className="space-y-1">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  isAtCapacity
                    ? 'bg-destructive'
                    : isNearCapacity
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                )}
                style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Botón de asignar */}
          {onAssign && selectedOrderId && (
            <Button
              size="sm"
              className="w-full"
              onClick={() => onAssign(driver.id)}
              disabled={isAssigning || isAtCapacity || !isCompatible}
              variant={!isCompatible ? 'outline' : 'default'}
            >
              {isAssigning ? 'Asignando...' : 'Asignar'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

