import { useMemo } from 'react';
import { useAuth } from './use-auth';
import { hasPermission, canAccessResource, getAllowedActions, type UserRole } from '../constants/roles';
import type { Permission } from '../constants/roles';

export function usePermissions() {
  const { role } = useAuth();

  const checkPermission = useMemo(
    () => (resource: string, action: Permission['action']): boolean => {
      if (!role) {
        return false;
      }
      return hasPermission(role, resource, action);
    },
    [role]
  );

  const checkAccess = useMemo(
    () => (resource: string): boolean => {
      if (!role) {
        return false;
      }
      return canAccessResource(role, resource);
    },
    [role]
  );

  const getActions = useMemo(
    () => (resource: string): Permission['action'][] => {
      if (!role) {
        return [];
      }
      return getAllowedActions(role, resource);
    },
    [role]
  );

  return {
    role,
    hasPermission: checkPermission,
    canAccess: checkAccess,
    getAllowedActions: getActions,
  };
}

