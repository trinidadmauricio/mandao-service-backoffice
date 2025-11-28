'use client';

import { PermissionGuard } from '@/components/auth/permission-guard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ruler } from 'lucide-react';

// Unidades de medida disponibles (basado en el enum de Prisma)
const UNITS_OF_MEASURE = [
  {
    value: 'UNIT',
    label: 'Unidad',
    description: 'Unidad individual del producto',
    category: 'Cantidad',
  },
  {
    value: 'KG',
    label: 'Kilogramo',
    description: 'Medida de peso en kilogramos',
    category: 'Peso',
  },
  {
    value: 'G',
    label: 'Gramo',
    description: 'Medida de peso en gramos',
    category: 'Peso',
  },
  {
    value: 'LITER',
    label: 'Litro',
    description: 'Medida de volumen en litros',
    category: 'Volumen',
  },
  {
    value: 'ML',
    label: 'Mililitro',
    description: 'Medida de volumen en mililitros',
    category: 'Volumen',
  },
  {
    value: 'BOX',
    label: 'Caja',
    description: 'Unidad de empaque en caja',
    category: 'Empaque',
  },
  {
    value: 'PACK',
    label: 'Paquete',
    description: 'Unidad de empaque en paquete',
    category: 'Empaque',
  },
] as const;

// Agrupar por categoría
const groupedUnits = UNITS_OF_MEASURE.reduce((acc, unit) => {
  if (!acc[unit.category]) {
    acc[unit.category] = [];
  }
  acc[unit.category].push(unit);
  return acc;
}, {} as Record<string, Array<typeof UNITS_OF_MEASURE[number]>>);

const categories = Object.keys(groupedUnits);

export default function UnitsOfMeasurePage() {
  return (
    <PermissionGuard
      resource="units-of-measure"
      action="read"
      allowedTenantTypes={['RETAIL']}
      fallback={
        <div className="py-6">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-2">Acceso Restringido</h2>
            <p className="text-muted-foreground">
              Esta funcionalidad solo está disponible para tenants de tipo RETAIL.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Ruler className="h-8 w-8" />
            Unidades de Medida
          </h1>
          <p className="text-muted-foreground mt-2">
            Lista de unidades de medida disponibles para productos
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Unidades Disponibles</CardTitle>
            <CardDescription>
              Estas son las unidades de medida que puedes usar al crear productos.
              Selecciona la unidad apropiada según el tipo de producto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {categories.map((category) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">
                    {category}
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {groupedUnits[category].map((unit) => (
                      <div
                        key={unit.value}
                        className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{unit.label}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {unit.description}
                            </p>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {unit.value}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                • Las unidades de medida se utilizan para especificar cómo se vende un producto.
              </p>
              <p>
                • Al crear un producto, selecciona la unidad de medida más apropiada.
              </p>
              <p>
                • Las unidades de peso (KG, G) y volumen (LITER, ML) son útiles para productos a granel.
              </p>
              <p>
                • Las unidades de empaque (BOX, PACK) son útiles para productos que se venden en cajas o paquetes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}

