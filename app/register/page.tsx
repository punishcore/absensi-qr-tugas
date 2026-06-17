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
      
      <div className="flex flex-col justify-center h-full w-full bg-zinc-50 dark:bg-zinc-950 order-2 lg:order-1 animate-left overflow-y-auto">
        <div className="w-full h-full">
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
            <div className="mt-4">
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
            </div>
          </AuthLayout>
        </div>
      </div>

      <div className="hidden lg:relative lg:flex flex-col justify-between p-12 text-white bg-zinc-900 h-full select-none order-1 lg:order-2 animate-right">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
          alt="Register Team Background"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        
        <div className="relative z-10">
          <span className="text-lg font-bold tracking-wider text-emerald-500 uppercase">
            Sistem Absensi QR
          </span>
        </div>
        
        <div className="relative z-10 space-y-3">
          <h2 className="text-4xl font-bold tracking-tight">
            Gabung Platform Presensi Digital
          </h2>
          <p className="text-zinc-300 text-sm max-w-md leading-relaxed">
            Daftarkan akun Mahasiswa Anda untuk kemudahan absensi kelas. Cukup scan kode QR dari dosen, presensi tercatat otomatis tanpa repot titip absen.
          </p>
        </div>
        
        <div className="relative z-10 text-xs text-zinc-400">
          &copy; {new Date().getFullYear()} QR Attendance System. All Rights Reserved.
        </div>
      </div>

    </div>
  );
}