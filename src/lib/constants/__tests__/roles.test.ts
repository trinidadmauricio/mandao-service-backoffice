import {
  hasPermission,
  canAccessResource,
  getAllowedActions,
  ROLE_PERMISSIONS,
} from '../roles';
import type { UserRole } from '../roles';

describe('Roles and Permissions', () => {
  describe('hasPermission', () => {
    it('should return true for OWNER for any permission', () => {
      expect(hasPermission('OWNER', 'orders', 'read')).toBe(true);
      expect(hasPermission('OWNER', 'orders', 'delete')).toBe(true);
      expect(hasPermission('OWNER', 'any-resource', 'any-action')).toBe(true);
    });

    it('should return true for SUPERVISOR with correct permissions', () => {
      expect(hasPermission('SUPERVISOR', 'orders', 'read')).toBe(true);
      expect(hasPermission('SUPERVISOR', 'orders', 'delete')).toBe(true);
      expect(hasPermission('SUPERVISOR', 'drivers', 'read')).toBe(true);
    });

    it('should return false for SUPERVISOR without permission', () => {
      expect(hasPermission('SUPERVISOR', 'tenants', 'update')).toBe(false);
    });

    it('should return true for MERCHANT_USER with limited permissions', () => {
      expect(hasPermission('MERCHANT_USER', 'orders', 'read')).toBe(true);
      expect(hasPermission('MERCHANT_USER', 'orders', 'create')).toBe(true);
      expect(hasPermission('MERCHANT_USER', 'products', 'read')).toBe(true);
    });

    it('should return false for MERCHANT_USER without permission', () => {
      expect(hasPermission('MERCHANT_USER', 'orders', 'delete')).toBe(false);
      expect(hasPermission('MERCHANT_USER', 'drivers', 'read')).toBe(false);
    });
  });

  describe('canAccessResource', () => {
    it('should return true for OWNER for any resource', () => {
      expect(canAccessResource('OWNER', 'any-resource')).toBe(true);
    });

    it('should return true for SUPERVISOR for allowed resources', () => {
      expect(canAccessResource('SUPERVISOR', 'orders')).toBe(true);
      expect(canAccessResource('SUPERVISOR', 'drivers')).toBe(true);
    });

    it('should return false for SUPERVISOR for restricted resources', () => {
      expect(canAccessResource('SUPERVISOR', 'tenants')).toBe(false);
    });

    it('should return true for MERCHANT_USER for allowed resources', () => {
      expect(canAccessResource('MERCHANT_USER', 'orders')).toBe(true);
      expect(canAccessResource('MERCHANT_USER', 'products')).toBe(true);
    });

    it('should return false for MERCHANT_USER for restricted resources', () => {
      expect(canAccessResource('MERCHANT_USER', 'drivers')).toBe(false);
      expect(canAccessResource('MERCHANT_USER', 'vehicles')).toBe(false);
    });
  });

  describe('getAllowedActions', () => {
    it('should return all actions for OWNER', () => {
      const actions = getAllowedActions('OWNER', 'orders');
      expect(actions).toContain('create');
      expect(actions).toContain('read');
      expect(actions).toContain('update');
      expect(actions).toContain('delete');
      expect(actions).toContain('manage');
    });

    it('should return specific actions for SUPERVISOR', () => {
      const actions = getAllowedActions('SUPERVISOR', 'orders');
      expect(actions).toContain('read');
      expect(actions).toContain('create');
      expect(actions).toContain('update');
      expect(actions).toContain('delete');
    });

    it('should return limited actions for MERCHANT_USER', () => {
      const actions = getAllowedActions('MERCHANT_USER', 'orders');
      expect(actions).toContain('read');
      expect(actions).toContain('create');
      expect(actions).toContain('update');
      expect(actions).not.toContain('delete');
    });

    it('should return empty array for restricted resource', () => {
      const actions = getAllowedActions('MERCHANT_USER', 'drivers');
      expect(actions).toEqual([]);
    });
  });

  describe('ROLE_PERMISSIONS', () => {
    it('should have permissions defined for all roles', () => {
      expect(ROLE_PERMISSIONS.OWNER).toBeDefined();
      expect(ROLE_PERMISSIONS.SUPERVISOR).toBeDefined();
      expect(ROLE_PERMISSIONS.MERCHANT_USER).toBeDefined();
      expect(ROLE_PERMISSIONS.CUSTOMER).toBeDefined();
    });

    it('should have OWNER with manage permission for all resources', () => {
      const ownerPermissions = ROLE_PERMISSIONS.OWNER;
      expect(ownerPermissions).toContainEqual({ resource: '*', action: 'manage' });
    });
  });
});

