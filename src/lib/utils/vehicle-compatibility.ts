/**
 * Utilidades para verificar compatibilidad entre vehículos y tamaños de carga
 */

export type CargoSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE';
export type VehicleType =
  | 'MOTORCYCLE'
  | 'SEDAN'
  | 'MINI_VAN'
  | 'PANEL'
  | 'TRUCK'
  | 'PICKUP';

// Mapeo de compatibilidad (debe coincidir con el backend)
const VEHICLE_COMPATIBILITY: Record<CargoSize, VehicleType[]> = {
  SMALL: ['MOTORCYCLE', 'SEDAN', 'MINI_VAN', 'PANEL', 'TRUCK', 'PICKUP'],
  MEDIUM: ['SEDAN', 'MINI_VAN', 'PANEL', 'TRUCK', 'PICKUP'],
  LARGE: ['MINI_VAN', 'PANEL', 'TRUCK', 'PICKUP'],
  EXTRA_LARGE: ['PANEL', 'TRUCK'],
};

/**
 * Verifica si un tipo de vehículo es compatible con un tamaño de carga
 */
export function isVehicleCompatibleWithCargo(
  vehicleType: VehicleType,
  cargoSize: CargoSize
): boolean {
  return VEHICLE_COMPATIBILITY[cargoSize].includes(vehicleType);
}

