'use client';

import { useState } from 'react';
import { useBranches } from '@/lib/hooks/use-branches';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface StockByBranch {
  branch_id: string;
  branch_name: string;
  stock: number;
}

interface StockManagerProps {
  variantId: string;
  currentStock?: number;
  stockByBranch?: StockByBranch[];
  onStockUpdate?: (branchId: string, quantity: number) => void;
}

export function StockManager({
  variantId,
  currentStock = 0,
  stockByBranch = [],
  onStockUpdate,
}: StockManagerProps) {
  const { data: branches } = useBranches();
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});

  const handleAdjustment = (branchId: string, quantity: number) => {
    setAdjustments((prev) => ({
      ...prev,
      [branchId]: (prev[branchId] || 0) + quantity,
    }));
  };

  const handleSave = () => {
    Object.entries(adjustments).forEach(([branchId, quantity]) => {
      if (quantity !== 0 && onStockUpdate) {
        onStockUpdate(branchId, quantity);
      }
    });
    setAdjustments({});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Stock</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Stock Total</p>
          <p className="text-2xl font-bold">{currentStock}</p>
        </div>

        {branches && branches.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Stock por Sucursal</h4>
            {branches.map((branch) => {
              const branchStock = stockByBranch.find((s) => s.branch_id === branch.id);
              const adjustment = adjustments[branch.id] || 0;
              const newStock = (branchStock?.stock || 0) + adjustment;

              return (
                <div key={branch.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{branch.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Stock actual: {branchStock?.stock || 0}
                      </p>
                    </div>
                    <Badge variant={newStock >= 0 ? 'default' : 'destructive'}>
                      {newStock >= 0 ? '+' : ''}
                      {adjustment !== 0 && `${adjustment}`}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAdjustment(branch.id, -1)}
                    >
                      -1
                    </Button>
                    <Input
                      type="number"
                      value={adjustment || ''}
                      onChange={(e) =>
                        setAdjustments((prev) => ({
                          ...prev,
                          [branch.id]: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-20"
                      placeholder="0"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAdjustment(branch.id, 1)}
                    >
                      +1
                    </Button>
                  </div>
                </div>
              );
            })}
            {Object.keys(adjustments).length > 0 && (
              <Button onClick={handleSave} className="w-full">
                Guardar Ajustes
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

