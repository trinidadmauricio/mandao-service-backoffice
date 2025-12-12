import { Badge } from '@/components/ui/badge';
import { Package, Package2, Box, Boxes } from 'lucide-react';

export type CargoSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE';

interface CargoSizeBadgeProps {
  cargoSize: CargoSize;
  showIcon?: boolean;
  variant?: 'default' | 'secondary' | 'outline';
}

const cargoSizeConfig: Record<
  CargoSize,
  {
    label: string;
    icon: React.ReactNode;
    color: string;
  }
> = {
  SMALL: {
    label: 'Pequeño',
    icon: <Package className="h-3 w-3" />,
    color: 'text-blue-600 dark:text-blue-400',
  },
  MEDIUM: {
    label: 'Mediano',
    icon: <Package2 className="h-3 w-3" />,
    color: 'text-green-600 dark:text-green-400',
  },
  LARGE: {
    label: 'Grande',
    icon: <Box className="h-3 w-3" />,
    color: 'text-orange-600 dark:text-orange-400',
  },
  EXTRA_LARGE: {
    label: 'Extra Grande',
    icon: <Boxes className="h-3 w-3" />,
    color: 'text-red-600 dark:text-red-400',
  },
};

export function CargoSizeBadge({
  cargoSize,
  showIcon = true,
  variant = 'outline',
}: CargoSizeBadgeProps) {
  const config = cargoSizeConfig[cargoSize];

  return (
    <Badge variant={variant} className="gap-1">
      {showIcon && <span className={config.color}>{config.icon}</span>}
      <span>{config.label}</span>
    </Badge>
  );
}

