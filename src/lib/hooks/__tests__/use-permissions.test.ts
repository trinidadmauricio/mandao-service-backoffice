import { renderHook } from '@testing-library/react';
import { usePermissions } from '../use-permissions';
import { useAuth } from '../use-auth';

// Mock useAuth
jest.mock('../use-auth');

describe('usePermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return false for all permissions when no role', () => {
    (useAuth as jest.Mock).mockReturnValue({
      role: null,
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasPermission('orders', 'read')).toBe(false);
    expect(result.current.canAccess('orders')).toBe(false);
    expect(result.current.getAllowedActions('orders')).toEqual([]);
  });

  it('should return correct permissions for OWNER role', () => {
    (useAuth as jest.Mock).mockReturnValue({
      role: 'OWNER',
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasPermission('orders', 'read')).toBe(true);
    expect(result.current.hasPermission('orders', 'delete')).toBe(true);
    expect(result.current.canAccess('orders')).toBe(true);
    expect(result.current.getAllowedActions('orders')).toContain('read');
    expect(result.current.getAllowedActions('orders')).toContain('delete');
  });

  it('should return correct permissions for SUPERVISOR role', () => {
    (useAuth as jest.Mock).mockReturnValue({
      role: 'SUPERVISOR',
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasPermission('orders', 'read')).toBe(true);
    expect(result.current.hasPermission('orders', 'delete')).toBe(true);
    expect(result.current.hasPermission('tenants', 'update')).toBe(false);
    expect(result.current.canAccess('orders')).toBe(true);
    expect(result.current.canAccess('tenants')).toBe(false);
  });

  it('should return correct permissions for MERCHANT_USER role', () => {
    (useAuth as jest.Mock).mockReturnValue({
      role: 'MERCHANT_USER',
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasPermission('orders', 'read')).toBe(true);
    expect(result.current.hasPermission('orders', 'create')).toBe(true);
    expect(result.current.hasPermission('orders', 'delete')).toBe(false);
    expect(result.current.hasPermission('drivers', 'read')).toBe(false);
    expect(result.current.canAccess('orders')).toBe(true);
    expect(result.current.canAccess('drivers')).toBe(false);
  });
});

