'use client';

import { FormEvent } from 'react';
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';

export interface LoginFormProps {
  username: string;
  setUsername: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  onSubmit: (e: FormEvent) => void;
  submitting: boolean;
  error?: string;
}

export function LoginForm({
  username,
  setUsername,
  password,
  setPassword,
  onSubmit,
  submitting,
  error
}: LoginFormProps) {
  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <FormField
        id="username"
        name="username"
        label="Username"
        type="text"
        required
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Masukkan username (ex: admin, user)"
      />

      <FormField
        id="password"
        name="password"
        label="Password"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Masukkan password"
      />

      <div>
        <Button
          type="submit"
          fullWidth
          disabled={submitting}
        >
          {submitting ? 'Menghubungkan...' : 'Masuk'}
        </Button>
      </div>
    </form>
  );
}