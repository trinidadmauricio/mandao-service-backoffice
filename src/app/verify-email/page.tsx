'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Token de verificación no proporcionado');
      return;
    }

    const verifyEmail = async () => {
      try {
        await apiClient.get(endpoints.auth.verifyEmail, {
          params: { token },
        });
        setStatus('success');
        setMessage('Email verificado exitosamente');
      } catch (error) {
        setStatus('error');
        setMessage(
          error instanceof Error
            ? error.message
            : 'Error al verificar el email. El token puede haber expirado.'
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verificación de Email</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Verificando tu email...'}
            {status === 'success' && 'Email verificado'}
            {status === 'error' && 'Error en la verificación'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Verificando...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <p className="text-center text-green-600">{message}</p>
              <Link href="/login">
                <Button className="w-full">Ir a Iniciar Sesión</Button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-center text-destructive">{message}</p>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Volver a Iniciar Sesión
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

