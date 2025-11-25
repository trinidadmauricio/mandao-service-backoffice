'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/date';
import { formatCurrency, type CurrencyCode } from '@/lib/utils/currency';
import type { PaymentTransaction } from '@/lib/hooks/use-payments';
import { RefundDialog } from './refund-dialog';
import { usePermissions } from '@/lib/hooks/use-permissions';

interface PaymentDetailCardProps {
  payment: PaymentTransaction;
  orderId: string;
}

export function PaymentDetailCard({ payment, orderId }: PaymentDetailCardProps) {
  const { hasPermission } = usePermissions();

  const transactionTypeLabels: Record<string, string> = {
    CHARGE: 'Cargo',
    REFUND: 'Reembolso',
    AUTHORIZATION: 'Autorización',
    CAPTURE: 'Captura',
  };

  const paymentMethodLabels: Record<string, string> = {
    CARD: 'Tarjeta',
    CASH: 'Efectivo',
    TRANSFER: 'Transferencia',
    WALLET: 'Billetera',
  };

  const statusLabels: Record<string, string> = {
    PENDING: 'Pendiente',
    COMPLETED: 'Completado',
    FAILED: 'Fallido',
    CANCELLED: 'Cancelado',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Detalle de Transacción</CardTitle>
          <Badge
            variant={
              payment.status === 'COMPLETED'
                ? 'default'
                : payment.status === 'PENDING'
                ? 'secondary'
                : payment.status === 'FAILED'
                ? 'destructive'
                : 'outline'
            }
          >
            {statusLabels[payment.status] || payment.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Monto</p>
          <p className="text-2xl font-bold">
            {formatCurrency(payment.amount, payment.currency as CurrencyCode)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Tipo</p>
            <p className="font-medium">
              {transactionTypeLabels[payment.transaction_type] || payment.transaction_type}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Método</p>
            <p className="font-medium">
              {paymentMethodLabels[payment.payment_method] || payment.payment_method}
            </p>
          </div>
        </div>

        {payment.card_last4 && (
          <div>
            <p className="text-sm text-muted-foreground">Tarjeta</p>
            <p className="font-medium">
              •••• {payment.card_last4} {payment.card_brand && `(${payment.card_brand})`}
            </p>
          </div>
        )}

        {payment.charge_id && (
          <div>
            <p className="text-sm text-muted-foreground">Stripe Charge ID</p>
            <p className="font-mono text-sm">{payment.charge_id}</p>
          </div>
        )}

        {payment.refund_id && (
          <div>
            <p className="text-sm text-muted-foreground">Stripe Refund ID</p>
            <p className="font-mono text-sm">{payment.refund_id}</p>
          </div>
        )}

        {payment.payment_intent_id && (
          <div>
            <p className="text-sm text-muted-foreground">Payment Intent ID</p>
            <p className="font-mono text-sm">{payment.payment_intent_id}</p>
          </div>
        )}

        <div>
          <p className="text-sm text-muted-foreground">Fecha</p>
          <p className="font-medium">{formatDate(payment.created_at)}</p>
        </div>

        {payment.metadata && Object.keys(payment.metadata).length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground">Metadatos</p>
            <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
              {JSON.stringify(payment.metadata, null, 2)}
            </pre>
          </div>
        )}

        {hasPermission('payments', 'update') &&
          payment.transaction_type === 'CHARGE' &&
          payment.status === 'COMPLETED' && (
            <div className="pt-4 border-t">
              <RefundDialog
                transactionId={payment.id}
                transactionAmount={payment.amount}
                currency={payment.currency}
                orderId={orderId}
              />
            </div>
          )}
      </CardContent>
    </Card>
  );
}

