import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Cliente Axios configurado para la API
 * Incluye interceptors para JWT, refresh token y tenant
 */
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor: Agregar JWT y tenant
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Obtener token del cookie (httpOnly cookie se envía automáticamente, pero por si acaso)
        const token = Cookies.get("access_token");
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        } else if (!token) {
          // Log para debugging - solo en desarrollo
          if (process.env.NODE_ENV === "development") {
            console.warn("[ApiClient] No access token found in cookies");
          }
        }

        // Obtener tenant_id del cookie o del contexto
        // NO enviar X-Tenant-Id en el endpoint de login porque el usuario aún no está autenticado
        // El tenant_id debe venir del usuario autenticado, no de una cookie previa
        const isLoginEndpoint = config.url?.includes("/auth/login");
        if (!isLoginEndpoint) {
          // Obtener el rol del usuario desde las cookies
          // LOGISTICS_PROVIDER y SUPERVISOR no tienen tenant_id, no deben enviar el header
          const userCookie = Cookies.get("user");
          let userRole: string | null = null;
          if (userCookie) {
            try {
              const user = JSON.parse(userCookie);
              userRole = user.role;
            } catch {
              // Si hay error parseando, continuar sin rol
            }
          }

          // Roles que NO deben enviar X-Tenant-Id porque no tienen tenant_id
          const rolesWithoutTenant = ["LOGISTICS_PROVIDER", "SUPERVISOR"];
          const shouldSkipTenantHeader =
            userRole && rolesWithoutTenant.includes(userRole);

          if (!shouldSkipTenantHeader) {
            // Prioridad: selected_tenant_id (para SAAS_ADMIN) > tenant_id (del usuario)
            const selectedTenantId = Cookies.get("selected_tenant_id");
            const userTenantId = Cookies.get("tenant_id");
            const tenantId = selectedTenantId || userTenantId;
            if (tenantId && config.headers) {
              config.headers["X-Tenant-Id"] = tenantId;
            }
          }
        }

        // Agregar Accept-Language para i18n
        const locale = Cookies.get("locale") || "es";
        if (config.headers) {
          config.headers["Accept-Language"] = locale;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor: Manejar errores y refresh token
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Si es 401 y no hemos intentado refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Intentar refresh token (si está disponible)
            const refreshToken = Cookies.get("refresh_token");
            if (refreshToken) {
              // Refresh token endpoint con prefijo /api/v1
              const response = await axios.post(
                `${API_BASE_URL}/api/v1/auth/refresh`,
                { refresh_token: refreshToken },
                { withCredentials: true }
              );

              const { access_token } = response.data.data;
              Cookies.set("access_token", access_token, { expires: 7 });

              // Reintentar request original
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
              }
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Si refresh falla, limpiar cookies y redirigir a login
            Cookies.remove("access_token");
            Cookies.remove("refresh_token");
            Cookies.remove("tenant_id");
            Cookies.remove("user");

            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  public getInstance(): AxiosInstance {
    return this.client;
  }

  // Métodos helper
  public async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  public async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  public async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  public async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  public async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
}

// Exportar instancia singleton
export const apiClient = new ApiClient();
export default apiClient.getInstance();
