'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOrderRating } from '@/lib/hooks/use-orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const ratingSchema = z.object({
  customer_rating: z.number().min(1).max(5),
  driver_rating: z.number().min(1).max(5).optional(),
  customer_comment: z.string().optional(),
  driver_comment: z.string().optional(),
});

type RatingFormData = z.infer<typeof ratingSchema>;

interface RatingFormProps {
  orderId: string;
  onSuccess?: () => void;
}

export function RatingForm({ orderId, onSuccess }: RatingFormProps) {
  const { toast } = useToast();
  const orderRating = useOrderRating();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      customer_rating: 5,
    },
  });

  const onSubmit = async (data: RatingFormData) => {
    try {
      await orderRating.mutateAsync({
        orderId,
        customer_rating: data.customer_rating,
        driver_rating: data.driver_rating,
        customer_comment: data.customer_comment,
        driver_comment: data.driver_comment,
      });
      toast({
        title: 'Calificación registrada',
        description: 'La calificación ha sido registrada exitosamente.',
      });
      onSuccess?.();
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Hubo un error al registrar la calificación.',
        variant: 'destructive',
      });
    }
  };

  const isPending = orderRating.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calificar Orden</CardTitle>
        <CardDescription>Califica la orden y el servicio de entrega</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer_rating">Calificación del Cliente * (1-5)</Label>
            <Input
              id="customer_rating"
              type="number"
              min="1"
              max="5"
              {...register('customer_rating', { valueAsNumber: true })}
              disabled={isPending}
            />
            {errors.customer_rating && (
              <p className="text-sm text-destructive">{errors.customer_rating.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver_rating">Calificación del Driver (1-5)</Label>
            <Input
              id="driver_rating"
              type="number"
              min="1"
              max="5"
              {...register('driver_rating', { valueAsNumber: true })}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_comment">Comentario del Cliente</Label>
            <textarea
              id="customer_comment"
              {...register('customer_comment')}
              disabled={isPending}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver_comment">Comentario del Driver</Label>
            <textarea
              id="driver_comment"
              {...register('driver_comment')}
              disabled={isPending}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Registrando...' : 'Enviar Calificación'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

