'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { TenantSelector } from './tenant-selector';

export function Header() {
  const { user, logout } = useAuth();
  const isSAASAdmin = user && (user.role === 'SAAS_ADMIN' || user.role === 'SAAS_EDITOR');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold">Mandao Service</h1>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <>
              {isSAASAdmin && <TenantSelector />}
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm">
                  {user.first_name} {user.last_name}
                </span>
                <span className="text-xs text-muted-foreground">({user.role})</span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

