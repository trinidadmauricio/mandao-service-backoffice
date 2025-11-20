import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { LoginResponse, User } from '@/types/api';
import type { UserRole } from '../constants/roles';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    role: null,
  });

  // Cargar usuario desde cookies al montar
  useEffect(() => {
    const userCookie = Cookies.get('user');
    const token = Cookies.get('access_token');

    if (userCookie && token) {
      try {
        const user = JSON.parse(userCookie) as User;
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          role: user.role as UserRole,
        });
      } catch {
        // Si hay error parseando, limpiar cookies
        Cookies.remove('user');
        Cookies.remove('access_token');
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          role: null,
        });
      }
    } else {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        role: null,
      });
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      try {
        const response = await apiClient.post<{ data: LoginResponse }>(endpoints.auth.login, {
          email,
          password,
        });

        const { access_token, user: loginUser } = response.data.data;

        // Mapear el usuario de la respuesta del login al tipo User completo
        const user: User = {
          id: loginUser.id,
          email: loginUser.email,
          first_name: loginUser.first_name,
          last_name: loginUser.last_name,
          role: loginUser.role as User['role'],
          email_verified: loginUser.email_verified,
          tenant_id: loginUser.tenant_id ?? undefined, // Los usuarios SAAS_ADMIN no tienen tenant_id
          logistics_provider_id: loginUser.logistics_provider_id ?? undefined,
          // Campos opcionales que no vienen en la respuesta del login
          active: true,
        };

        // Guardar en cookies con path explícito
        Cookies.set('access_token', access_token, { expires: 7, path: '/' });
        Cookies.set('user', JSON.stringify(user), { expires: 7, path: '/' });
        if (user.tenant_id) {
          Cookies.set('tenant_id', user.tenant_id, { expires: 7, path: '/' });
        }

        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          role: user.role as UserRole,
        });

        // Redirigir al dashboard
        router.push('/dashboard');
      } catch (error) {
        throw error;
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    // Limpiar cookies
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    Cookies.remove('user');
    Cookies.remove('tenant_id');

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      role: null,
    });

    // Redirigir a login
    router.push('/login');
  }, [router]);

  const register = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      phone?: string
    ): Promise<void> => {
      try {
        await apiClient.post(endpoints.auth.register, {
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          phone,
        });
      } catch (error) {
        throw error;
      }
    },
    []
  );

  return {
    ...state,
    login,
    logout,
    register,
  };
}

