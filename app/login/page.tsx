'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/app/components/templates/AuthLayout';
import { LoginForm } from '@/app/components/organisms/LoginForm';

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push(user.role === 'admin' ? '/admin' : '/user');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Harap isi username dan password.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const res = await login(username, password);
      if (!res.success) {
        setError(res.error || 'Login gagal.');
      }
    } catch {
      setError('Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-screen w-screen overflow-hidden bg-white dark:bg-zinc-900 relative">
      <style>{`
        @keyframes slideFromLeft {
          from { transform: translateX(-30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideFromRight {
          from { transform: translateX(30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-left { animation: slideFromLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-right { animation: slideFromRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
      
      <div className="hidden lg:relative lg:flex flex-col justify-between p-12 text-white bg-zinc-900 h-full select-none order-1 animate-left">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
          alt="Login Workspace Background"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        
        <div className="relative z-10">
          <span className="text-lg font-bold tracking-wider text-emerald-500 uppercase">
            Sistem Absensi QR
          </span>
        </div>
        
        <div className="relative z-10 space-y-3">
          <h2 className="text-4xl font-bold tracking-tight">
            Scan QR, Langsung Presensi!
          </h2>
          <p className="text-zinc-300 text-sm max-w-md leading-relaxed">
            Silakan masuk ke akun Anda untuk melakukan absensi kehadiran, melihat riwayat kelas, dan memantau rekap data kehadiran secara real-time.
          </p>
        </div>
        
        <div className="relative z-10 text-xs text-zinc-400">
          &copy; {new Date().getFullYear()} QR Attendance System. All Rights Reserved.
        </div>
      </div>

      <div className="flex flex-col justify-center h-full w-full bg-zinc-50 dark:bg-zinc-950 order-2 animate-right overflow-y-auto">
        <div className="w-full h-full">
          <AuthLayout
            title="Masuk ke Akun Anda"
            subtitle={
              <>
                Atau{' '}
                <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300">
                  daftar akun baru secara gratis
                </Link>
              </>
            }
            loading={loading || !!user}
          >
            <div className="mt-4">
              <LoginForm
                username={username}
                setUsername={setUsername}
                password={password}
                setPassword={setPassword}
                onSubmit={handleSubmit}
                submitting={submitting}
                error={error}
              />
            </div>

            <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-950">
                <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Akun Demo Default:</h4>
                <div className="mt-2 space-y-1 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                  <p><span className="font-semibold text-zinc-700 dark:text-zinc-200">Admin:</span> admin / admin</p>
                  <p><span className="font-semibold text-zinc-700 dark:text-zinc-200">User:</span> user / user</p>
                </div>
              </div>
            </div>
          </AuthLayout>
        </div>
      </div>

    </div>
  );
}