'use client';

import { useMemo } from 'react';

import { Textarea } from '@/components/ui/textarea';
import { PolygonDrawer } from '@/components/shared/polygon-drawer';
import { formatWKT } from '@/lib/utils/wkt-utils';

export interface BoundaryInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** id passed from FormControl for accessibility (label association) */
  id?: string;
}

export function BoundaryInput({ value, onChange, disabled, id }: BoundaryInputProps) {
  const formattedWkt = useMemo(() => (value?.trim() ? formatWKT(value) : ''), [value]);

  return (
    <div className="space-y-3">
      <PolygonDrawer value={value} onChange={onChange} disabled={disabled} active />

      <div className="space-y-2">
        <Textarea
          id={id}
          readOnly
          aria-readonly="true"
          className="font-mono"
          placeholder="POLYGON((lng lat, ...))"
          value={formattedWkt}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          WKT (solo lectura). Por ahora se genera automáticamente desde el mapa.
        </p>
      </div>
    </div>
  );
}

