'use client';

import { useState, useEffect, useRef } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Package, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ModifyItemsDialogProps {
  orderId: string;
  orderType?: 'RETAIL' | 'ON_DEMAND';
  currentItems?: Array<{
    id?: string;
    product_snapshot?: Record<string, unknown>;
    quantity: number;
    unit_price: number;
    notes?: string;
  }>;
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  buttonClassName?: string;
}

export function ModifyItemsDialog({ orderId, orderType = 'RETAIL', currentItems = [], buttonSize = 'default', buttonClassName }: ModifyItemsDialogProps) {
  const [open, setOpen] = useState(false);
  const previousOpenRef = useRef(false);
  const isSubmittingRef = useRef(false);
  
  // Función para inicializar items desde currentItems
  const initializeItems = () => {
    if (currentItems.length > 0) {
      return currentItems.map((item, idx) => ({
        id: item.id || `temp-${idx}-${Date.now()}`,
        product_snapshot: item.product_snapshot || { name: '', price: 0, currency: 'USD' },
        quantity: item.quantity,
        unit_price: item.unit_price,
        notes: item.notes || '',
      }));
    }
    return [
      {
        id: `temp-0-${Date.now()}`,
        product_snapshot: { name: '', price: 0, currency: 'USD' },
        quantity: 1,
        unit_price: 0,
        notes: '',
      },
    ];
  };

  const [items, setItems] = useState(initializeItems);
  const modifyItems = useModifyItems();
  const { toast } = useToast();

  // Resetear items cuando el diálogo se abre (no cuando se cierra para evitar perder cambios)
  useEffect(() => {
    // Solo resetear cuando el diálogo pasa de cerrado a abierto
    if (open && !previousOpenRef.current && !isSubmittingRef.current) {
      setItems(initializeItems());
    }
    previousOpenRef.current = open;
    if (!open) {
      isSubmittingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // Solo dependemos de 'open', no de currentItems para evitar reseteos constantes

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `temp-${items.length}-${Date.now()}`,
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

  // Determinar si la cantidad debe ser entera (RETAIL) o decimal (ON_DEMAND)
  const isQuantityInteger = orderType === 'RETAIL';

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast({
        title: 'Error',
        description: 'Debe agregar al menos un item',
        variant: 'destructive',
      });
      return;
    }

    // Validar que todas las cantidades sean válidas
    const invalidItems = items.filter((item) => {
      if (isQuantityInteger) {
        return !Number.isInteger(item.quantity) || item.quantity < 1;
      }
      return item.quantity < 0.001;
    });

    if (invalidItems.length > 0) {
      toast({
        title: 'Error',
        description: isQuantityInteger 
          ? 'Las cantidades deben ser números enteros mayores a 0'
          : 'Las cantidades deben ser mayores a 0',
        variant: 'destructive',
      });
      return;
    }

    isSubmittingRef.current = true;
    try {
      await modifyItems.mutateAsync({
        orderId,
        items: items.map((item) => ({
          product_snapshot: item.product_snapshot,
          quantity: isQuantityInteger ? Math.floor(item.quantity) : item.quantity,
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
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size={buttonSize} className={buttonClassName}>
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
          {items.map((item, index) => {
            // Determinar si el item es nuevo (id empieza con "temp-") o existente
            const isNewItem = !item.id || item.id.startsWith('temp-');
            
            return (
              <div key={item.id || `item-${index}`} className="border rounded p-4 space-y-4">
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
                    <Select
                      value={(item.product_snapshot.currency as string) || 'USD'}
                      onValueChange={(value) =>
                        handleItemChange(index, 'product_snapshot.currency', value)
                      }
                      disabled={modifyItems.isPending || !isNewItem}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar moneda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GTQ">GTQ - Quetzal Guatemalteco</SelectItem>
                        <SelectItem value="HNL">HNL - Lempira Hondureño</SelectItem>
                        <SelectItem value="NIO">NIO - Córdoba Nicaragüense</SelectItem>
                        <SelectItem value="CRC">CRC - Colón Costarricense</SelectItem>
                        <SelectItem value="PAB">PAB - Balboa Panameño</SelectItem>
                        <SelectItem value="SVC">SVC - Colón Salvadoreño</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                <div className="space-y-2">
                  <Label>Cantidad *</Label>
                  <Input
                    type="number"
                    step={isQuantityInteger ? "1" : "0.001"}
                    min={isQuantityInteger ? "1" : "0.001"}
                    value={item.quantity}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      // Permitir campo vacío temporalmente mientras el usuario escribe
                      if (inputValue === '' || inputValue === '-') {
                        handleItemChange(index, 'quantity', 0);
                        return;
                      }
                      const numValue = isQuantityInteger 
                        ? parseInt(inputValue, 10) 
                        : parseFloat(inputValue);
                      if (!isNaN(numValue)) {
                        handleItemChange(index, 'quantity', numValue);
                      }
                    }}
                    onBlur={(e) => {
                      // Asegurar que el valor sea válido al perder el foco
                      const inputValue = e.target.value;
                      if (inputValue === '' || inputValue === '-') {
                        handleItemChange(index, 'quantity', isQuantityInteger ? 1 : 0.001);
                        return;
                      }
                      const numValue = isQuantityInteger 
                        ? parseInt(inputValue, 10) 
                        : parseFloat(inputValue);
                      if (isNaN(numValue) || numValue < (isQuantityInteger ? 1 : 0.001)) {
                        handleItemChange(index, 'quantity', isQuantityInteger ? 1 : 0.001);
                      } else if (isQuantityInteger && !Number.isInteger(numValue)) {
                        handleItemChange(index, 'quantity', Math.max(1, Math.floor(numValue)));
                      }
                    }}
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
            );
          })}
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


