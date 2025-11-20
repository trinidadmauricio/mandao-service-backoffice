import { render, screen } from '@testing-library/react';
import { RoleGuard } from '../role-guard';
import { usePermissions } from '@/lib/hooks/use-permissions';

// Mock usePermissions
jest.mock('@/lib/hooks/use-permissions');

describe('RoleGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when role is allowed', () => {
    (usePermissions as jest.Mock).mockReturnValue({
      role: 'OWNER',
      hasPermission: () => true,
    });

    render(
      <RoleGuard allowedRoles={['OWNER', 'SUPERVISOR']}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should not render children when role is not allowed', () => {
    (usePermissions as jest.Mock).mockReturnValue({
      role: 'MERCHANT_USER',
      hasPermission: () => false,
    });

    render(
      <RoleGuard allowedRoles={['OWNER', 'SUPERVISOR']}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when permission is granted', () => {
    (usePermissions as jest.Mock).mockReturnValue({
      role: 'SUPERVISOR',
      hasPermission: (resource: string, action: string) => {
        return resource === 'orders' && action === 'read';
      },
    });

    render(
      <RoleGuard requiredPermission={{ resource: 'orders', action: 'read' }}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should render fallback when permission is not granted', () => {
    (usePermissions as jest.Mock).mockReturnValue({
      role: 'MERCHANT_USER',
      hasPermission: () => false,
    });

    render(
      <RoleGuard
        requiredPermission={{ resource: 'orders', action: 'delete' }}
        fallback={<div>Access Denied</div>}
      >
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
  });
});

