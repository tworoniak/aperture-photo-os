import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

function LoadingScreen() {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='flex flex-col items-center gap-4'>
        <div className='w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin' />
        <p className='text-sm text-muted-foreground'>Loading…</p>
      </div>
    </div>
  );
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isSignedIn } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isSignedIn) return <Navigate to='/login' replace />;
  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to='/unauthorized' replace />;
  }

  return <Outlet />;
}
