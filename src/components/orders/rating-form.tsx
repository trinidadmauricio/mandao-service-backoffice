'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOrderRating } from '@/lib/hooks/use-orders';
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
import { Textarea } from '@/components/ui/textarea';
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

  const form = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      customer_rating: 5,
      driver_rating: undefined,
      customer_comment: '',
      driver_comment: '',
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customer_rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calificación del Cliente * (1-5)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      disabled={isPending}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="driver_rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calificación del Driver (1-5)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      disabled={isPending}
                      {...field}
                      value={field.value || ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer_comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentario del Cliente</FormLabel>
                  <FormControl>
                    <Textarea disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="driver_comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentario del Driver</FormLabel>
                  <FormControl>
                    <Textarea disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Registrando...' : 'Enviar Calificación'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

