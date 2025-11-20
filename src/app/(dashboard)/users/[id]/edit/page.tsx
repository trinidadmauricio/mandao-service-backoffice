'use client';

import { useParams } from 'next/navigation';
import { UserForm } from '@/components/users/user-form';
import { PermissionGuard } from '@/components/auth/permission-guard';

export default function EditUserPage() {
  const params = useParams();
  const userId = params.id as string;

  return (
    <PermissionGuard
      resource="users"
      action="update"
      fallback={
        <div className="py-6">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-2">Acceso Restringido</h2>
            <p className="text-muted-foreground">No tienes permisos para editar usuarios.</p>
          </div>
        </div>
      }
    >
      <div className="py-6">
        <UserForm userId={userId} />
      </div>
    </PermissionGuard>
  );
}

