"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, {
  NavigationControl,
  type MapRef,
  type ViewStateChangeEvent,
} from "react-map-gl/mapbox";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { Search, Trash2, Crosshair } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useGeocodingSearch } from "@/lib/hooks/use-geocoding";
import { cn } from "@/lib/utils/cn";
import { coordsToWKT, wktToCoords, type LatLng } from "@/lib/utils/wkt-utils";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const DEFAULT_CENTER: [number, number] = [-85.0, 14.0]; // [lng, lat] for Mapbox
const DEFAULT_ZOOM = 6;
const POLYGON_ZOOM = 13;

// Convert LatLng[] to GeoJSON Polygon coordinates [[[lng, lat], ...]]
function coordsToGeoJSON(
  coords: LatLng[]
): GeoJSON.Feature<GeoJSON.Polygon> | null {
  if (!coords || coords.length < 3) return null;

  // Ensure the polygon is closed (first point = last point)
  const ring = coords.map((c) => [c.lng, c.lat] as [number, number]);
  if (
    ring[0][0] !== ring[ring.length - 1][0] ||
    ring[0][1] !== ring[ring.length - 1][1]
  ) {
    ring.push([...ring[0]] as [number, number]);
  }

  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [ring],
    },
  };
}

// Extract coordinates from GeoJSON feature
function geoJSONToCoords(feature: GeoJSON.Feature<GeoJSON.Polygon>): LatLng[] {
  const ring = feature.geometry.coordinates[0];
  // Remove the closing point (duplicate of first)
  const coords = ring.slice(0, -1);
  return coords.map(([lng, lat]) => ({ lat, lng }));
}

// Calculate bounds for a polygon
function getBoundsForCoords(
  coords: LatLng[]
): [[number, number], [number, number]] | null {
  if (coords.length < 3) return null;

  let minLng = Infinity,
    maxLng = -Infinity,
    minLat = Infinity,
    maxLat = -Infinity;

  for (const c of coords) {
    if (c.lng < minLng) minLng = c.lng;
    if (c.lng > maxLng) maxLng = c.lng;
    if (c.lat < minLat) minLat = c.lat;
    if (c.lat > maxLat) maxLat = c.lat;
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

export interface PolygonDrawerProps {
  value?: string; // WKT POLYGON
  onChange?: (wkt: string) => void;
  disabled?: boolean;
  /** If the map is currently visible (e.g. active tab) */
  active?: boolean;
  className?: string;
  height?: number;
}

export function PolygonDrawer({
  value,
  onChange,
  disabled = false,
  active = true,
  className,
  height = 420,
}: PolygonDrawerProps) {
  const mapRef = useRef<MapRef | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const lastEmittedWktRef = useRef<string | null>(null);
  const isUpdatingFromExternalRef = useRef(false);

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [polygonCoords, setPolygonCoords] = useState<LatLng[] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResult, setSelectedResult] = useState<number | null>(null);
  const [viewState, setViewState] = useState({
    longitude: DEFAULT_CENTER[0],
    latitude: DEFAULT_CENTER[1],
    zoom: DEFAULT_ZOOM,
  });

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: searchResults, isLoading: isSearching } = useGeocodingSearch(
    { q: debouncedSearch, limit: 5, lang: "es" },
    debouncedSearch.trim().length > 2
  );

  // Clear selectedResult when searchResults change
  useEffect(() => {
    setSelectedResult(null);
  }, [searchResults]);

  // Initialize MapboxDraw when map loads
  const handleMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Create draw control
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: disabled
        ? {}
        : {
            polygon: true,
            trash: true,
          },
      defaultMode: "simple_select",
      styles: [
        // Polygon fill
        {
          id: "gl-draw-polygon-fill",
          type: "fill",
          filter: [
            "all",
            ["==", "$type", "Polygon"],
            ["!=", "mode", "static"],
          ],
          paint: {
            "fill-color": "#2563eb",
            "fill-outline-color": "#2563eb",
            "fill-opacity": 0.1,
          },
        },
        // Polygon outline
        {
          id: "gl-draw-polygon-stroke-active",
          type: "line",
          filter: [
            "all",
            ["==", "$type", "Polygon"],
            ["!=", "mode", "static"],
          ],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#2563eb",
            "line-width": 2,
          },
        },
        // Vertex point
        {
          id: "gl-draw-polygon-and-line-vertex-active",
          type: "circle",
          filter: [
            "all",
            ["==", "meta", "vertex"],
            ["==", "$type", "Point"],
            ["!=", "mode", "static"],
          ],
          paint: {
            "circle-radius": 6,
            "circle-color": "#fff",
            "circle-stroke-color": "#2563eb",
            "circle-stroke-width": 2,
          },
        },
        // Midpoint
        {
          id: "gl-draw-polygon-midpoint",
          type: "circle",
          filter: ["all", ["==", "meta", "midpoint"], ["==", "$type", "Point"]],
          paint: {
            "circle-radius": 4,
            "circle-color": "#2563eb",
          },
        },
        // Static polygon (disabled mode)
        {
          id: "gl-draw-polygon-fill-static",
          type: "fill",
          filter: ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
          paint: {
            "fill-color": "#2563eb",
            "fill-outline-color": "#2563eb",
            "fill-opacity": 0.1,
          },
        },
        {
          id: "gl-draw-polygon-stroke-static",
          type: "line",
          filter: ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#2563eb",
            "line-width": 2,
          },
        },
      ],
    });

    map.addControl(draw, "top-right");
    drawRef.current = draw;

    // Event handlers for draw changes
    const handleDrawCreate = () => {
      if (disabled || isUpdatingFromExternalRef.current) return;
      const data = draw.getAll();
      if (data.features.length > 0) {
        // Keep only the last polygon
        const lastFeature = data.features[data.features.length - 1];
        if (lastFeature.geometry.type === "Polygon") {
          // Remove all other features
          const featureIds = data.features
            .filter((f) => f.id !== lastFeature.id)
            .map((f) => f.id as string);
          if (featureIds.length > 0) {
            draw.delete(featureIds);
          }

          const coords = geoJSONToCoords(
            lastFeature as GeoJSON.Feature<GeoJSON.Polygon>
          );
          setPolygonCoords(coords);
          const wkt = coordsToWKT(coords);
          lastEmittedWktRef.current = wkt;
          onChange?.(wkt);
        }
      }
    };

    const handleDrawUpdate = () => {
      if (disabled || isUpdatingFromExternalRef.current) return;
      const data = draw.getAll();
      if (data.features.length > 0) {
        const feature = data.features[0];
        if (feature.geometry.type === "Polygon") {
          const coords = geoJSONToCoords(
            feature as GeoJSON.Feature<GeoJSON.Polygon>
          );
          setPolygonCoords(coords);
          const wkt = coordsToWKT(coords);
          lastEmittedWktRef.current = wkt;
          onChange?.(wkt);
        }
      }
    };

    const handleDrawDelete = () => {
      if (disabled || isUpdatingFromExternalRef.current) return;
      setPolygonCoords(null);
      lastEmittedWktRef.current = "";
      onChange?.("");
    };

    map.on("draw.create", handleDrawCreate);
    map.on("draw.update", handleDrawUpdate);
    map.on("draw.delete", handleDrawDelete);

    setIsMapLoaded(true);

    // Cleanup
    return () => {
      map.off("draw.create", handleDrawCreate);
      map.off("draw.update", handleDrawUpdate);
      map.off("draw.delete", handleDrawDelete);
      if (map.hasControl(draw)) {
        map.removeControl(draw);
      }
      drawRef.current = null;
    };
  }, [disabled, onChange]);

  // Sync external WKT value to map
  useEffect(() => {
    if (!isMapLoaded) return;
    const draw = drawRef.current;
    const map = mapRef.current?.getMap();
    if (!draw || !map) return;

    const wkt = value?.trim() ?? "";

    // If this change originated from the drawer itself, skip
    if (lastEmittedWktRef.current && wkt === lastEmittedWktRef.current) {
      return;
    }

    isUpdatingFromExternalRef.current = true;

    // Clear existing features
    draw.deleteAll();

    if (!wkt) {
      setPolygonCoords(null);
      isUpdatingFromExternalRef.current = false;
      return;
    }

    const coords = wktToCoords(wkt);
    if (!coords || coords.length < 3) {
      setPolygonCoords(null);
      isUpdatingFromExternalRef.current = false;
      return;
    }

    setPolygonCoords(coords);

    // Add the polygon to the draw control
    const geojson = coordsToGeoJSON(coords);
    if (geojson) {
      draw.add(geojson);

      // Fit bounds to the polygon
      const bounds = getBoundsForCoords(coords);
      if (bounds) {
        map.fitBounds(bounds, { padding: 50, duration: 500 });
      }
    }

    isUpdatingFromExternalRef.current = false;
  }, [value, isMapLoaded]);

  // Resize map when active changes (for tabs)
  useEffect(() => {
    if (!active || !isMapLoaded) return;
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Defer to next tick so layout is visible
    const t = window.setTimeout(() => {
      map.resize();

      // Fit to polygon if exists
      if (polygonCoords && polygonCoords.length >= 3) {
        const bounds = getBoundsForCoords(polygonCoords);
        if (bounds) {
          map.fitBounds(bounds, { padding: 50, duration: 500 });
        }
      }
    }, 0);

    return () => window.clearTimeout(t);
  }, [active, isMapLoaded, polygonCoords]);

  const handleViewStateChange = useCallback((evt: ViewStateChangeEvent) => {
    setViewState(evt.viewState);
  }, []);

  const handleClear = useCallback(() => {
    if (disabled) return;
    const draw = drawRef.current;
    if (draw) {
      draw.deleteAll();
    }
    setPolygonCoords(null);
    lastEmittedWktRef.current = "";
    onChange?.("");
  }, [disabled, onChange]);

  const handleFit = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    if (polygonCoords && polygonCoords.length >= 3) {
      const bounds = getBoundsForCoords(polygonCoords);
      if (bounds) {
        map.fitBounds(bounds, { padding: 50, duration: 500 });
      }
    } else {
      map.flyTo({
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        duration: 500,
      });
    }
  }, [polygonCoords]);

  const handleSelectResult = useCallback(
    (index: number) => {
      const result = searchResults?.data[index];
      if (!result) return;
      setSelectedResult(index);
      setSearchQuery(result.display_name);

      const map = mapRef.current?.getMap();
      if (map) {
        map.flyTo({
          center: [result.lng, result.lat],
          zoom: POLYGON_ZOOM,
          duration: 500,
        });
      }
    },
    [searchResults]
  );

  const verticesCount = polygonCoords
    ? Math.max(0, polygonCoords.length)
    : 0;

  const mapStyle = useMemo(
    () => "mapbox://styles/mapbox/streets-v12",
    []
  );

  if (!MAPBOX_TOKEN) {
    return (
      <div
        className={cn(
          "flex items-center justify-center border rounded-lg bg-muted",
          className
        )}
        style={{ height }}
      >
        <p className="text-muted-foreground">
          Error: NEXT_PUBLIC_MAPBOX_TOKEN no está configurado
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar dirección para centrar el mapa..."
            disabled={disabled}
            className="pl-10"
          />

          {searchResults &&
            searchResults.data.length > 0 &&
            searchQuery.trim().length > 2 && (
              <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {searchResults.data.map((result, index) => (
                  <button
                    key={`${result.osm_type ?? "osm"}-${
                      result.osm_id ?? index
                    }`}
                    type="button"
                    onClick={() => handleSelectResult(index)}
                    className={cn(
                      "w-full text-left px-4 py-2 hover:bg-muted transition-colors",
                      selectedResult === index && "bg-muted"
                    )}
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
            <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg px-4 py-2">
              <div className="text-sm text-muted-foreground">Buscando...</div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            {disabled
              ? "Vista previa de la zona."
              : "Dibuja un polígono usando el botón de polígono en el mapa."}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFit}
            >
              <Crosshair className="h-4 w-4 mr-2" />
              Centrar
            </Button>
            {!disabled && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClear}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden" style={{ height }}>
        <Map
          ref={mapRef}
          {...viewState}
          onMove={handleViewStateChange}
          onLoad={handleMapLoad}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle={mapStyle}
          style={{ width: "100%", height: "100%" }}
          dragPan={true}
          scrollZoom={true}
          touchZoomRotate={true}
          doubleClickZoom={!disabled}
          keyboard={true}
        >
          <NavigationControl position="bottom-right" />
        </Map>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Vértices: {verticesCount}</span>
        {value?.trim() ? (
          <span className="font-mono truncate max-w-[50%]">{value.trim()}</span>
        ) : (
          <span className="font-mono">Sin polígono</span>
        )}
      </div>
    </div>
  );
}
