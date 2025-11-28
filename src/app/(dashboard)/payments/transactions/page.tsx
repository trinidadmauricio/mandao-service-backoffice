'use client';

import { useState } from 'react';
import { usePaymentsTransactions, type PaymentTransactionsFilters } from '@/lib/hooks/use-payments';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils/date';
import { formatCurrency, type CurrencyCode } from '@/lib/utils/currency';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PaymentsTransactionsPage() {
  const [filters, setFilters] = useState<PaymentTransactionsFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const { data: transactions, isLoading, error } = usePaymentsTransactions(filters);

  const filteredTransactions = transactions?.filter((transaction) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      transaction.id.toLowerCase().includes(search) ||
      transaction.order_id?.toLowerCase().includes(search) ||
      transaction.charge_id?.toLowerCase().includes(search) ||
      transaction.payment_intent_id?.toLowerCase().includes(search)
    );
  });

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
    <PermissionGuard
      resource="payments"
      action="read"
      fallback={<div>No tienes permisos para acceder a esta página</div>}
    >
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando transacciones...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">Error al cargar las transacciones.</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Transacciones de Pago</h1>
              <p className="text-muted-foreground mt-2">Gestiona las transacciones de pago</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lista de Transacciones</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por ID o orden..."
                      className="pl-8 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={filters.transaction_type || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        transaction_type: e.target.value as PaymentTransactionsFilters['transaction_type'] || undefined,
                      })
                    }
                  >
                    <option value="">Todos los tipos</option>
                    <option value="CHARGE">Cargo</option>
                    <option value="REFUND">Reembolso</option>
                    <option value="AUTHORIZATION">Autorización</option>
                    <option value="CAPTURE">Captura</option>
                  </select>
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={filters.status || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        status: e.target.value as PaymentTransactionsFilters['status'] || undefined,
                      })
                    }
                  >
                    <option value="">Todos los estados</option>
                    <option value="PENDING">Pendiente</option>
                    <option value="COMPLETED">Completado</option>
                    <option value="FAILED">Fallido</option>
                    <option value="CANCELLED">Cancelado</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTransactions && filteredTransactions.length > 0 ? (
                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">
                              {formatCurrency(transaction.amount, transaction.currency as CurrencyCode)}
                            </p>
                            <Badge variant="outline">
                              {transactionTypeLabels[transaction.transaction_type] || transaction.transaction_type}
                            </Badge>
                            <Badge
                              variant={
                                transaction.status === 'COMPLETED'
                                  ? 'default'
                                  : transaction.status === 'PENDING'
                                  ? 'secondary'
                                  : transaction.status === 'FAILED'
                                  ? 'destructive'
                                  : 'outline'
                              }
                            >
                              {statusLabels[transaction.status] || transaction.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Método: {paymentMethodLabels[transaction.payment_method] || transaction.payment_method}
                            {transaction.card_last4 && ` • •••• ${transaction.card_last4}`}
                            {transaction.card_brand && ` (${transaction.card_brand})`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.order_id ? (
                              <>Orden: {transaction.order_id.substring(0, 8)}... | </>
                            ) : (
                              'Sin orden asociada | '
                            )}
                            {formatDate(transaction.created_at)}
                          </p>
                          {transaction.charge_id && (
                            <p className="text-xs text-muted-foreground">
                              Stripe Charge: {transaction.charge_id}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {transaction.order_id && (
                          <Link href={`/orders/${transaction.order_id}`}>
                            <Button variant="outline" size="sm">
                              Ver Orden
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {searchTerm ? 'No se encontraron transacciones con ese criterio' : 'No hay transacciones registradas'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </PermissionGuard>
  );
}

