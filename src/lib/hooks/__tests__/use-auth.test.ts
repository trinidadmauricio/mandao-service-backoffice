import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../use-auth';
import { apiClient } from '@/lib/api/client';
import Cookies from 'js-cookie';

// Mock dependencies
jest.mock('@/lib/api/client');
jest.mock('js-cookie');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Cookies.get as jest.Mock).mockReturnValue(null);
  });

  it('should initialize with no user when no cookies are present', async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.role).toBeNull();
  });

  it('should load user from cookies when available', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      role: 'OWNER',
      tenant_id: 'tenant-1',
      email_verified: true,
      active: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    (Cookies.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'user') return JSON.stringify(mockUser);
      if (key === 'access_token') return 'token-123';
      return null;
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.role).toBe('OWNER');
  });

  it('should handle login successfully', async () => {
    const mockLoginResponse = {
      data: {
        data: {
          access_token: 'token-123',
          token_type: 'Bearer',
          expires_in: 3600,
          user: {
            id: '1',
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
            role: 'OWNER',
            email_verified: true,
          },
        },
      },
    };

    (apiClient.post as jest.Mock).mockResolvedValue(mockLoginResponse);
    (Cookies.set as jest.Mock).mockImplementation(() => {});

    const { result } = renderHook(() => useAuth());

    await result.current.login('test@example.com', 'password123');

    expect(apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      { email: 'test@example.com', password: 'password123' }
    );
    expect(Cookies.set).toHaveBeenCalledWith('access_token', 'token-123', { expires: 7 });
  });

  it('should handle logout', () => {
    const { result } = renderHook(() => useAuth());

    result.current.logout();

    expect(Cookies.remove).toHaveBeenCalledWith('access_token');
    expect(Cookies.remove).toHaveBeenCalledWith('refresh_token');
    expect(Cookies.remove).toHaveBeenCalledWith('user');
    expect(Cookies.remove).toHaveBeenCalledWith('tenant_id');
  });
});

