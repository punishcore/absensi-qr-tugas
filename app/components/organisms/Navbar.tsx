'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Logo } from '../atoms/Logo';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <nav className="border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Logo />

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{user.name}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{user.id}</span>
            </div>
            
            <Badge variant={user.role === 'admin' ? 'admin' : user.role === 'guru' ? 'guru' : 'mahasiswa'}>
              {user.role === 'admin' ? 'Admin' : user.role === 'guru' ? 'Guru' : 'Mahasiswa'}
            </Badge>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
