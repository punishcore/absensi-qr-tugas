'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/app/components/templates/AuthLayout';
import { RegisterForm } from '@/app/components/organisms/RegisterForm';

export default function RegisterPage() {
  const { user, register, loading } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // Registration is restricted to Mahasiswa only; role is fixed
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'guru') router.push('/guru');
      else router.push('/user');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password) {
      setError('Harap isi semua kolom pendaftaran.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const res = await register(username, name, password, 'user');
      if (res.success) {
        setSuccess(true);
        // Redirection is handled by the useEffect above
      } else {
        setError(res.error || 'Pendaftaran gagal.');
      }
    } catch {
      setError('Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Daftar Akun Baru"
      subtitle={
        <>
          Sudah punya akun?{' '}
          <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300">
            Masuk sekarang
          </Link>
        </>
      }
      loading={loading || !!user}
    >
      <RegisterForm
        name={name}
        setName={setName}
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
        success={success}
      />
    </AuthLayout>
  );
}
