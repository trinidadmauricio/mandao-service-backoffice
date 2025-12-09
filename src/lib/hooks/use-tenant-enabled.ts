import { useAuth } from './use-auth';
import { useSelectedTenant } from './use-selected-tenant';
import { USER_ROLE } from '../constants/roles';

/**
 * Hook que determina si una query debe estar habilitada basándose en:
 * - Si el auth ha terminado de cargar
 * - Si el usuario es SAAS_ADMIN/SAAS_EDITOR y tiene un tenant seleccionado
 * - Si el usuario tiene otro rol (siempre habilitado)
 * 
 * @returns boolean - true si la query debe ejecutarse, false si no
 */
export function useTenantEnabled(): boolean {
  const { user, isLoading } = useAuth();
  const { selectedTenantId } = useSelectedTenant();

  // Si el auth está cargando, no habilitar
  if (isLoading) {
    return false;
  }

  // Si no hay usuario, no habilitar
  if (!user) {
    return false;
  }

  const isSAASAdmin = user.role === USER_ROLE.SAAS_ADMIN || user.role === USER_ROLE.SAAS_EDITOR;

  // Si es SAAS_ADMIN/SAAS_EDITOR, solo habilitar si tiene tenant seleccionado
  if (isSAASAdmin) {
    return !!selectedTenantId;
  }

  // Para otros roles, siempre habilitar
  return true;
}

