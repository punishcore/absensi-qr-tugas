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
      <LoginForm
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
      />

      <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-950">
          <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Akun Demo Default:</h4>
          <div className="mt-2 space-y-1 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            <p><span className="font-semibold text-zinc-700 dark:text-zinc-200">Admin:</span> admin / admin</p>
            <p><span className="font-semibold text-zinc-700 dark:text-zinc-200">User:</span> user / user</p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
