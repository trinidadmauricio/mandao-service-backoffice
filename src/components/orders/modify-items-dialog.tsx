'use client';

import { useState } from 'react';
import { useModifyItems } from '@/lib/hooks/use-orders';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Package, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ModifyItemsDialogProps {
  orderId: string;
  currentItems?: Array<{
    id?: string;
    product_snapshot?: Record<string, unknown>;
    quantity: number;
    unit_price: number;
    notes?: string;
  }>;
}

export function ModifyItemsDialog({ orderId, currentItems = [] }: ModifyItemsDialogProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(
    currentItems.length > 0
      ? currentItems.map((item) => ({
          product_snapshot: item.product_snapshot || { name: '', price: 0, currency: 'USD' },
          quantity: item.quantity,
          unit_price: item.unit_price,
          notes: item.notes || '',
        }))
      : [
          {
            product_snapshot: { name: '', price: 0, currency: 'USD' },
            quantity: 1,
            unit_price: 0,
            notes: '',
          },
        ]
  );
  const modifyItems = useModifyItems();
  const { toast } = useToast();

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        product_snapshot: { name: '', price: 0, currency: 'USD' },
        quantity: 1,
        unit_price: 0,
        notes: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: unknown) => {
    const updated = [...items];
    if (field.startsWith('product_snapshot.')) {
      const snapshotField = field.replace('product_snapshot.', '');
      updated[index] = {
        ...updated[index],
        product_snapshot: {
          ...updated[index].product_snapshot,
          [snapshotField]: value,
        },
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
    }
    setItems(updated);
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast({
        title: 'Error',
        description: 'Debe agregar al menos un item',
        variant: 'destructive',
      });
      return;
    }

    try {
      await modifyItems.mutateAsync({
        orderId,
        items: items.map((item) => ({
          product_snapshot: item.product_snapshot,
          quantity: item.quantity,
          unit_price: item.unit_price,
          notes: item.notes || undefined,
        })),
      });
      toast({
        title: 'Items modificados',
        description: 'Los items de la orden han sido actualizados exitosamente.',
      });
      setOpen(false);
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Hubo un error al modificar los items.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Package className="h-4 w-4 mr-2" />
          Modificar Items
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modificar Items</DialogTitle>
          <DialogDescription>
            Modifica los items de la orden. Esta acción sigue el patrón inmutable (crea nuevos
            registros para todos los items).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Item
            </Button>
          </div>
          {items.map((item, index) => (
            <div key={index} className="border rounded p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Item {index + 1}</h4>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Nombre del Producto *</Label>
                  <Input
                    value={(item.product_snapshot.name as string) || ''}
                    onChange={(e) =>
                      handleItemChange(index, 'product_snapshot.name', e.target.value)
                    }
                    disabled={modifyItems.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Precio *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(item.product_snapshot.price as number) || 0}
                    onChange={(e) =>
                      handleItemChange(index, 'product_snapshot.price', parseFloat(e.target.value) || 0)
                    }
                    disabled={modifyItems.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Moneda *</Label>
                  <Input
                    maxLength={3}
                    value={(item.product_snapshot.currency as string) || 'USD'}
                    onChange={(e) =>
                      handleItemChange(index, 'product_snapshot.currency', e.target.value)
                    }
                    disabled={modifyItems.isPending}
                    placeholder="USD"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cantidad *</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)
                    }
                    disabled={modifyItems.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Precio Unitario *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) =>
                      handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)
                    }
                    disabled={modifyItems.isPending}
                  />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label>Notas</Label>
                  <Input
                    value={item.notes}
                    onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                    disabled={modifyItems.isPending}
                  />
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={modifyItems.isPending || items.length === 0}>
              {modifyItems.isPending ? 'Modificando...' : 'Modificar Items'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


