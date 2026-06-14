'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'guru' | 'user')[];
}

function getRoleRedirect(role: 'admin' | 'guru' | 'user'): string {
  if (role === 'admin') return '/admin';
  if (role === 'guru') return '/guru';
  return '/user';
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their default dashboard if they attempt to access forbidden routes
        router.push(getRoleRedirect(user.role));
      }
    }
  }, [user, loading, router, allowedRoles]);

  if (loading || !user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-zinc-400 font-medium">Memuat halaman...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
