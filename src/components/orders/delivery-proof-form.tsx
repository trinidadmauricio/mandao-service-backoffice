'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDeliveryProof } from '@/lib/hooks/use-orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const deliveryProofSchema = z.object({
  proof_type: z.enum(['SIGNATURE', 'PHOTO', 'CODE', 'NONE']),
  delivered_to_name: z.string().min(1, 'El nombre del receptor es requerido'),
  delivered_at: z.string().min(1, 'La fecha de entrega es requerida'),
  driver_notes: z.string().optional(),
  proof_data: z.record(z.unknown()).optional(),
});

type DeliveryProofFormData = z.infer<typeof deliveryProofSchema>;

interface DeliveryProofFormProps {
  orderId: string;
  onSuccess?: () => void;
}

export function DeliveryProofForm({ orderId, onSuccess }: DeliveryProofFormProps) {
  const { toast } = useToast();
  const deliveryProof = useDeliveryProof();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeliveryProofFormData>({
    resolver: zodResolver(deliveryProofSchema),
    defaultValues: {
      proof_type: 'NONE',
    },
  });

  const onSubmit = async (data: DeliveryProofFormData) => {
    try {
      await deliveryProof.mutateAsync({
        orderId,
        proof_type: data.proof_type,
        proof_data: Object.keys(proofData).length > 0 ? proofData : {},
        delivered_to_name: data.delivered_to_name,
        delivered_at: data.delivered_at,
        driver_notes: data.driver_notes,
      });
      toast({
        title: 'Prueba de entrega registrada',
        description: 'La prueba de entrega ha sido registrada exitosamente.',
      });
      onSuccess?.();
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Hubo un error al registrar la prueba de entrega.',
        variant: 'destructive',
      });
    }
  };

  const isPending = deliveryProof.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Prueba de Entrega</CardTitle>
        <CardDescription>
          Registra la prueba de entrega de la orden (firma, foto, código, etc.)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proof_type">Tipo de Prueba</Label>
            <select
              id="proof_type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...register('proof_type')}
              disabled={isPending}
            >
              <option value="NONE">Ninguna</option>
              <option value="SIGNATURE">Firma</option>
              <option value="PHOTO">Foto</option>
              <option value="CODE">Código</option>
            </select>
            {errors.proof_type && (
              <p className="text-sm text-destructive">{errors.proof_type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivered_to_name">Nombre del Receptor *</Label>
            <Input
              id="delivered_to_name"
              {...register('delivered_to_name')}
              disabled={isPending}
            />
            {errors.delivered_to_name && (
              <p className="text-sm text-destructive">{errors.delivered_to_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivered_at">Fecha y Hora de Entrega *</Label>
            <Input
              id="delivered_at"
              type="datetime-local"
              {...register('delivered_at')}
              disabled={isPending}
            />
            {errors.delivered_at && (
              <p className="text-sm text-destructive">{errors.delivered_at.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver_notes">Notas del Driver</Label>
            <textarea
              id="driver_notes"
              {...register('driver_notes')}
              disabled={isPending}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Registrando...' : 'Registrar Prueba'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

