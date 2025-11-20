import { UserForm } from '@/components/users/user-form';
import { PermissionGuard } from '@/components/auth/permission-guard';

export default function NewUserPage() {
  return (
    <PermissionGuard
      resource="users"
      action="create"
      fallback={
        <div className="py-6">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-2">Acceso Restringido</h2>
            <p className="text-muted-foreground">No tienes permisos para crear usuarios.</p>
          </div>
        </div>
      }
    >
      <div className="py-6">
        <UserForm />
      </div>
    </PermissionGuard>
  );
}

