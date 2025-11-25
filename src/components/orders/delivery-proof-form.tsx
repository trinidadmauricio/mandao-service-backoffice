'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDeliveryProof } from '@/lib/hooks/use-orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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

  const form = useForm<DeliveryProofFormData>({
    resolver: zodResolver(deliveryProofSchema),
    defaultValues: {
      proof_type: 'NONE',
      delivered_to_name: '',
      delivered_at: '',
      driver_notes: '',
      proof_data: {},
    },
  });

  const onSubmit = async (data: DeliveryProofFormData) => {
    try {
      await deliveryProof.mutateAsync({
        orderId,
        proof_type: data.proof_type,
        proof_data: data.proof_data || {},
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="proof_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Prueba</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NONE">Ninguna</SelectItem>
                      <SelectItem value="SIGNATURE">Firma</SelectItem>
                      <SelectItem value="PHOTO">Foto</SelectItem>
                      <SelectItem value="CODE">Código</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="delivered_to_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Receptor *</FormLabel>
                  <FormControl>
                    <Input disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="delivered_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha y Hora de Entrega *</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="driver_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas del Driver</FormLabel>
                  <FormControl>
                    <Textarea disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Registrando...' : 'Registrar Prueba'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

