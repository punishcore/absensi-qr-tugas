'use client';

import { FormEvent } from 'react';
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';

export interface RegisterFormProps {
  name: string;
  setName: (val: string) => void;
  username: string;
  setUsername: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  onSubmit: (e: FormEvent) => void;
  submitting: boolean;
  error?: string;
  success?: boolean;
}

export function RegisterForm({
  name,
  setName,
  username,
  setUsername,
  password,
  setPassword,
  onSubmit,
  submitting,
  error,
  success
}: RegisterFormProps) {
  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400">
          Pendaftaran berhasil! Akun Anda sedang menunggu persetujuan Admin sebelum dapat masuk. Mengalihkan ke halaman login dalam 4 detik...
        </div>
      )}

      <FormField
        id="name"
        name="name"
        label="Nama Lengkap"
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Masukkan nama lengkap Anda"
      />

      <FormField
        id="username"
        name="username"
        label="Username"
        type="text"
        required
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Buat username unik"
      />

      <FormField
        id="password"
        name="password"
        label="Password"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Buat password aman"
      />

      <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400">
        <span className="font-semibold">Informasi:</span> Registrasi ini hanya untuk akun <strong>Mahasiswa</strong>. Akun Guru & Admin hanya dapat dibuat oleh Administrator.
      </div>

      <div>
        <Button
          type="submit"
          fullWidth
          disabled={submitting}
        >
          {submitting ? 'Mendaftarkan...' : 'Daftar Sekarang'}
        </Button>
      </div>
    </form>
  );
}
