'use client';

import { useParams } from 'next/navigation';
import { useOrderPayments } from '@/lib/hooks/use-payments';
import { useOrder } from '@/lib/hooks/use-orders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import { RefundDialog } from '@/components/payments/refund-dialog';
import { RoleGuard } from '@/components/auth/role-guard';
import { usePermissions } from '@/lib/hooks/use-permissions';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderPaymentsPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { data: payments, isLoading, error } = useOrderPayments(orderId);
  const { data: order } = useOrder(orderId);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando pagos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">Error al cargar los pagos de la orden.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPaid = payments?.reduce((sum, payment) => {
    if (payment.transaction_type === 'CHARGE' && payment.status === 'COMPLETED') {
      return sum + payment.amount;
    }
    if (payment.transaction_type === 'REFUND' && payment.status === 'COMPLETED') {
      return sum - payment.amount;
    }
    return sum;
  }, 0) || 0;

  return (
    <RoleGuard
      allowedRoles={['OWNER', 'SUPERVISOR']}
      fallback={<div>No tienes permisos para acceder a esta página</div>}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/orders/${orderId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Orden
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Pagos de la Orden</h1>
              {order && (
                <p className="text-muted-foreground mt-2">
                  Orden: {order.order_display_number} | Tracking: {order.tracking_code}
                </p>
              )}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resumen de Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Pagado:</span>
                <span className="font-bold text-lg">
                  {formatCurrency(totalPaid, payments?.[0]?.currency || 'USD')}
                </span>
              </div>
              {order?.order_summary_totals?.[0] && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total de la Orden:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      Number(order.order_summary_totals[0].total_amount),
                      order.order_summary_totals[0].currency
                    )}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transacciones</CardTitle>
          </CardHeader>
          <CardContent>
            {payments && payments.length > 0 ? (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">
                            {formatCurrency(payment.amount, payment.currency)}
                          </p>
                          <Badge variant="outline">
                            {transactionTypeLabels[payment.transaction_type] || payment.transaction_type}
                          </Badge>
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
                        <p className="text-sm text-muted-foreground mt-1">
                          Método: {paymentMethodLabels[payment.payment_method] || payment.payment_method}
                          {payment.card_last4 && ` • •••• ${payment.card_last4}`}
                          {payment.card_brand && ` (${payment.card_brand})`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(payment.created_at)}
                        </p>
                        {payment.charge_id && (
                          <p className="text-xs text-muted-foreground">
                            Stripe Charge: {payment.charge_id}
                          </p>
                        )}
                        {payment.refund_id && (
                          <p className="text-xs text-muted-foreground">
                            Stripe Refund: {payment.refund_id}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {hasPermission('payments', 'update') &&
                        payment.transaction_type === 'CHARGE' &&
                        payment.status === 'COMPLETED' && (
                          <RefundDialog
                            transactionId={payment.id}
                            transactionAmount={payment.amount}
                            currency={payment.currency}
                            orderId={orderId}
                          />
                        )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No hay pagos registrados para esta orden
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}

