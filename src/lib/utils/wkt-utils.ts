export type LatLng = { lat: number; lng: number };

type WktValidationResult = { valid: true } | { valid: false; error: string };

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function almostEqual(a: number, b: number, eps = 1e-12): boolean {
  return Math.abs(a - b) <= eps;
}

function samePoint(a: LatLng, b: LatLng): boolean {
  return almostEqual(a.lat, b.lat) && almostEqual(a.lng, b.lng);
}

function normalizeClosedRing(ring: LatLng[]): LatLng[] {
  if (ring.length === 0) return ring;
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (samePoint(first, last)) return ring;
  return [...ring, first];
}

function parsePolygonWktRings(wkt: string): LatLng[][] | null {
  const trimmed = wkt.trim();
  const match = trimmed.match(/^\s*POLYGON\s*\(\s*\((.*)\)\s*\)\s*$/i);
  if (!match) return null;

  const inner = match[1].trim();
  if (!inner) return null;

  // Split outer/inner rings: "a,b,c),(d,e,f" → ["a,b,c", "d,e,f"]
  const ringStrings = inner.split(/\)\s*,\s*\(/);

  const rings: LatLng[][] = [];

  for (const ringStr of ringStrings) {
    const coordPairs = ringStr
      .trim()
      .split(/\s*,\s*/)
      .filter(Boolean);

    const ring: LatLng[] = [];
    for (const pair of coordPairs) {
      const parts = pair.trim().split(/\s+/);
      if (parts.length < 2) return null;

      const lng = Number(parts[0]);
      const lat = Number(parts[1]);

      if (!isFiniteNumber(lng) || !isFiniteNumber(lat)) return null;
      ring.push({ lat, lng });
    }

    rings.push(normalizeClosedRing(ring));
  }

  return rings;
}

function formatNum(n: number, decimals = 6): string {
  // Keep it stable but not overly verbose
  return Number(n.toFixed(decimals)).toString();
}

/**
 * Converts an array of Leaflet-like coords (lat/lng) to WKT POLYGON.
 * Note: WKT uses lng lat order.
 */
export function coordsToWKT(coords: LatLng[]): string {
  const ring = normalizeClosedRing(coords);
  const coordText = ring.map((p) => `${formatNum(p.lng)} ${formatNum(p.lat)}`).join(', ');
  return `POLYGON((${coordText}))`;
}

/**
 * Parses a WKT POLYGON into an array of coords (outer ring only).
 * Returns null if not a valid POLYGON WKT.
 */
export function wktToCoords(wkt: string): LatLng[] | null {
  const rings = parsePolygonWktRings(wkt);
  if (!rings || rings.length === 0) return null;
  return rings[0];
}

export function validateWKT(wkt: string): WktValidationResult {
  const rings = parsePolygonWktRings(wkt);
  if (!rings) return { valid: false, error: 'Formato inválido. Se esperaba POLYGON((lng lat, ...))' };

  const outer = rings[0];
  if (!outer || outer.length < 4) {
    return { valid: false, error: 'El polígono debe tener al menos 3 puntos (y estar cerrado).' };
  }

  const first = outer[0];
  const last = outer[outer.length - 1];
  if (!samePoint(first, last)) {
    return { valid: false, error: 'El polígono debe estar cerrado (primer punto = último punto).' };
  }

  // Unique points ignoring the closing duplicate
  const unique: LatLng[] = [];
  for (let i = 0; i < outer.length - 1; i += 1) {
    const p = outer[i];
    if (!unique.some((u) => samePoint(u, p))) unique.push(p);
  }

  if (unique.length < 3) {
    return { valid: false, error: 'El polígono debe tener al menos 3 puntos distintos.' };
  }

  return { valid: true };
}

/**
 * Normalizes (pretty/consistent) a POLYGON WKT. If invalid, returns original string.
 */
export function formatWKT(wkt: string): string {
  const rings = parsePolygonWktRings(wkt);
  if (!rings || rings.length === 0) return wkt;

  const ringTexts = rings.map((ring) =>
    normalizeClosedRing(ring)
      .map((p) => `${formatNum(p.lng)} ${formatNum(p.lat)}`)
      .join(', ')
  );

  return `POLYGON((${ringTexts.join('),(')}))`;
}

