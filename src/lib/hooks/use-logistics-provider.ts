import { useMemo } from 'react';
import { useAuth } from './use-auth';

/**
 * Hook para obtener y validar logistics_provider_id del usuario
 */
export function useLogisticsProvider() {
  const { user } = useAuth();

  const logisticsProviderId = useMemo(() => {
    return user?.logistics_provider_id || null;
  }, [user?.logistics_provider_id]);

  const isLogisticsProvider = useMemo(() => {
    return user?.role === 'LOGISTICS_PROVIDER';
  }, [user?.role]);

  const validateAccess = useMemo(
    () => (resourceLogisticsProviderId: string | null): boolean => {
      if (!isLogisticsProvider) {
        return true; // No es LOGISTICS_PROVIDER, no necesita validación
      }

      if (!logisticsProviderId) {
        return false; // LOGISTICS_PROVIDER sin logistics_provider_id
      }

      if (!resourceLogisticsProviderId) {
        return false; // Recurso no pertenece a un proveedor
      }

      return logisticsProviderId === resourceLogisticsProviderId;
    },
    [isLogisticsProvider, logisticsProviderId]
  );

  return {
    logisticsProviderId,
    isLogisticsProvider,
    validateAccess,
  };
}

