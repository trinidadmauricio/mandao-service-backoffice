import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';

export interface GeocodingResult {
  name: string;
  display_name: string;
  lat: number;
  lng: number;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
  };
  osm_id?: number;
  osm_type?: string;
}

export interface GeocodingSearchParams {
  q: string;
  limit?: number;
  lang?: 'es' | 'en';
}

export interface GeocodingReverseParams {
  lat: number;
  lng: number;
  lang?: 'es' | 'en';
}

export interface GeocodingSearchResponse {
  status: string;
  data: GeocodingResult[];
  count: number;
}

export interface GeocodingReverseResponse {
  status: string;
  data: GeocodingResult;
}

/**
 * Hook para búsqueda de direcciones
 */
export function useGeocodingSearch(params: GeocodingSearchParams, enabled = true) {
  return useQuery({
    queryKey: ['geocoding', 'search', params],
    queryFn: async () => {
      const response = await apiClient.get<GeocodingSearchResponse>(
        endpoints.geocoding.search,
        {
          params: {
            q: params.q,
            limit: params.limit || 10,
            lang: params.lang,
          },
        }
      );
      return response.data;
    },
    enabled: enabled && !!params.q && params.q.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para reverse geocoding (coordenadas → dirección)
 */
export function useGeocodingReverse(params: GeocodingReverseParams, enabled = true) {
  return useQuery({
    queryKey: ['geocoding', 'reverse', params],
    queryFn: async () => {
      const response = await apiClient.get<GeocodingReverseResponse>(
        endpoints.geocoding.reverse,
        {
          params: {
            lat: params.lat,
            lng: params.lng,
            lang: params.lang,
          },
        }
      );
      return response.data;
    },
    enabled: enabled && params.lat !== undefined && params.lng !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

