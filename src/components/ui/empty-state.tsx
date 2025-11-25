import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { Package, Search, FileX, AlertCircle, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'search' | 'error' | 'empty';
  className?: string;
}

const defaultIcons = {
  default: <Package className="h-12 w-12 text-muted-foreground" />,
  search: <Search className="h-12 w-12 text-muted-foreground" />,
  error: <AlertCircle className="h-12 w-12 text-destructive" />,
  empty: <Inbox className="h-12 w-12 text-muted-foreground" />,
};

const defaultTitles = {
  default: 'No hay datos',
  search: 'No se encontraron resultados',
  error: 'Error al cargar',
  empty: 'Lista vacía',
};

const defaultDescriptions = {
  default: 'No hay información disponible en este momento.',
  search: 'Intenta ajustar tus filtros de búsqueda.',
  error: 'Ocurrió un error al cargar los datos. Por favor, intenta nuevamente.',
  empty: 'Aún no hay elementos en esta lista.',
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  variant = 'default',
  className,
}: EmptyStateProps) {
  const displayIcon = icon || defaultIcons[variant];
  const displayTitle = title || defaultTitles[variant];
  const displayDescription = description || defaultDescriptions[variant];

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="mb-4 text-muted-foreground">{displayIcon}</div>
      <h3 className="text-lg font-semibold mb-2">{displayTitle}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{displayDescription}</p>
      {action && (
        <Button onClick={action.onClick} variant="default">
          {action.label}
        </Button>
      )}
    </div>
  );
}

