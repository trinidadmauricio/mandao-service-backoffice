'use client';

import { useIncrementOrderCounter } from '@/lib/hooks/use-order-counters';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface IncrementCounterButtonProps {
  tenantId: string;
}

export function IncrementCounterButton({ tenantId }: IncrementCounterButtonProps) {
  const incrementCounter = useIncrementOrderCounter();
  const { toast } = useToast();

  const handleIncrement = async () => {
    try {
      const result = await incrementCounter.mutateAsync(tenantId);
      toast({
        title: 'Contador incrementado',
        description: `El nuevo valor es: ${result.new_value}`,
      });
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Hubo un error al incrementar el contador.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      onClick={handleIncrement}
      disabled={incrementCounter.isPending}
      variant="outline"
    >
      <Plus className="h-4 w-4 mr-2" />
      {incrementCounter.isPending ? 'Incrementando...' : 'Incrementar'}
    </Button>
  );
}

