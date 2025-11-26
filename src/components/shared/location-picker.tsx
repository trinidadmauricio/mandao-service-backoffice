'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Input } from '@/components/ui/input';
import { useGeocodingSearch, useGeocodingReverse } from '@/lib/hooks/use-geocoding';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { Search, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para iconos de Leaflet en Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Coordenadas centrales de Centro América
const CENTRAL_AMERICA_CENTER: [number, number] = [14.0, -85.0];
const DEFAULT_ZOOM = 6;

// Bounding box para validación
const BBOX = {
  minLat: 7.0,
  maxLat: 25.0,
  minLng: -90.0,
  maxLng: -60.0,
};

interface LocationPickerProps {
  lat?: number;
  lng?: number;
  onLocationChange: (lat: number, lng: number, address?: {
    street?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
  }) => void;
  disabled?: boolean;
  className?: string;
}

// Componente interno para manejar eventos del mapa
function MapEventHandler({
  onLocationChange,
  disabled,
}: {
  onLocationChange: (lat: number, lng: number) => void;
  disabled: boolean;
}) {
  useMapEvents({
    click(e) {
      if (disabled) return;
      const { lat, lng } = e.latlng;
      // Validar que esté dentro del bounding box
      if (
        lat >= BBOX.minLat &&
        lat <= BBOX.maxLat &&
        lng >= BBOX.minLng &&
        lng <= BBOX.maxLng
      ) {
        onLocationChange(lat, lng);
      }
    },
  });

  return null;
}

export function LocationPicker({
  lat,
  lng,
  onLocationChange,
  disabled = false,
  className = '',
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResult, setSelectedResult] = useState<number | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const markerRef = useRef<L.Marker>(null);

  // Búsqueda de direcciones
  const { data: searchResults, isLoading: isSearching } = useGeocodingSearch(
    {
      q: debouncedSearch,
      limit: 5,
      lang: 'es',
    },
    debouncedSearch.length > 2
  );

  // Reverse geocoding cuando se mueve el marker o se hace click
  const [reverseLat, setReverseLat] = useState<number | undefined>(undefined);
  const [reverseLng, setReverseLng] = useState<number | undefined>(undefined);

  const { data: reverseResult } = useGeocodingReverse(
    {
      lat: reverseLat!,
      lng: reverseLng!,
      lang: 'es',
    },
    reverseLat !== undefined && reverseLng !== undefined
  );

  // Actualizar coordenadas cuando cambia el marker
  const handleMarkerDragEnd = useCallback(() => {
    const marker = markerRef.current;
    if (marker) {
      const { lat, lng } = marker.getLatLng();
      // Validar que esté dentro del bounding box
      if (
        lat >= BBOX.minLat &&
        lat <= BBOX.maxLat &&
        lng >= BBOX.minLng &&
        lng <= BBOX.maxLng
      ) {
        setReverseLat(lat);
        setReverseLng(lng);
      }
    }
  }, []);

  // Manejar click en el mapa
  const handleMapClick = useCallback((newLat: number, newLng: number) => {
    if (!disabled) {
      setReverseLat(newLat);
      setReverseLng(newLng);
    }
  }, [disabled]);

  // Cuando se obtiene el resultado del reverse geocoding
  useEffect(() => {
    if (reverseResult?.data && reverseLat && reverseLng) {
      onLocationChange(reverseLat, reverseLng, reverseResult.data.address);
      setReverseLat(undefined);
      setReverseLng(undefined);
    } else if (reverseLat && reverseLng && !reverseResult) {
      // Si no hay resultado pero hay coordenadas, actualizar igual
      onLocationChange(reverseLat, reverseLng);
      setReverseLat(undefined);
      setReverseLng(undefined);
    }
  }, [reverseResult, reverseLat, reverseLng, onLocationChange]);

  // Seleccionar resultado de búsqueda
  const handleSelectResult = (index: number) => {
    const result = searchResults?.data[index];
    if (result) {
      setSelectedResult(index);
      setSearchQuery(result.display_name);
      onLocationChange(result.lat, result.lng, result.address);
    }
  };

  // Coordenadas iniciales o centro de Centro América
  const initialLat = lat || CENTRAL_AMERICA_CENTER[0];
  const initialLng = lng || CENTRAL_AMERICA_CENTER[1];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Campo de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar dirección..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={disabled}
          className="pl-10"
        />
        {/* Resultados de búsqueda */}
        {searchResults && searchResults.data.length > 0 && searchQuery.length > 2 && (
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {searchResults.data.map((result, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectResult(index)}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  selectedResult === index ? 'bg-blue-50' : ''
                }`}
              >
                <div className="font-medium">{result.name}</div>
                <div className="text-sm text-muted-foreground">
                  {result.display_name}
                </div>
              </button>
            ))}
          </div>
        )}
        {isSearching && (
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg px-4 py-2">
            <div className="text-sm text-muted-foreground">Buscando...</div>
          </div>
        )}
      </div>

      {/* Mapa */}
      <div className="border rounded-lg overflow-hidden" style={{ height: '400px' }}>
        <MapContainer
          center={[initialLat, initialLng]}
          zoom={initialLat === CENTRAL_AMERICA_CENTER[0] ? DEFAULT_ZOOM : 13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={!disabled}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {lat && lng && (
            <Marker
              position={[lat, lng]}
              draggable={!disabled}
              ref={markerRef}
              eventHandlers={{
                dragend: handleMarkerDragEnd,
              }}
            >
            </Marker>
          )}
          <MapEventHandler
            onLocationChange={handleMapClick}
            disabled={disabled}
          />
        </MapContainer>
      </div>

      {/* Coordenadas actuales */}
      {lat && lng && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>
            Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}
          </span>
        </div>
      )}
    </div>
  );
}

