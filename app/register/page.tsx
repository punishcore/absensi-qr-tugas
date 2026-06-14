'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-zinc-400 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-zinc-50 py-12 px-6 lg:px-8 dark:bg-zinc-950">
      {/* Background gradients for aesthetic look */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-2xl opacity-10 dark:opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-10 dark:opacity-20 animate-pulse delay-75"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center gap-2 items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20">
            QR
          </div>
          <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Absen<span className="text-emerald-500">QR</span>
          </span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Daftar Akun Baru
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-655 dark:text-zinc-400">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300">
            Masuk sekarang
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-md py-8 px-4 border border-zinc-200 shadow-xl rounded-2xl sm:px-10 dark:bg-zinc-900/80 dark:border-zinc-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400">
                {error}
              </div>
            )}
            
            {success && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-250 p-4 text-sm text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400">
                Pendaftaran berhasil! Akun Anda sedang menunggu persetujuan Admin sebelum dapat masuk. Mengalihkan ke halaman login dalam 4 detik...
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Nama Lengkap
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-xl border border-zinc-200 bg-white/50 py-2.5 px-3.5 text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white"
                  placeholder="Masukkan nama lengkap Anda"
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-xl border border-zinc-200 bg-white/50 py-2.5 px-3.5 text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white"
                  placeholder="Buat username unik"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-zinc-200 bg-white/50 py-2.5 px-3.5 text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white"
                  placeholder="Buat password aman"
                />
              </div>
            </div>

            {/* Role is fixed to Mahasiswa for public registration */}
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400">
              <span className="font-semibold">ℹ️ Informasi:</span> Registrasi ini hanya untuk akun <strong>Mahasiswa</strong>. Akun Guru & Admin hanya dapat dibuat oleh Administrator.
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full justify-center rounded-xl bg-emerald-600 py-3 px-4 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all dark:bg-emerald-500 dark:hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? 'Mendaftarkan...' : 'Daftar Sekarang'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
