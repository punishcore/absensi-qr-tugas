import { ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '../atoms/Logo';
import { Card, CardContent } from '../atoms/Card';
import { Spinner } from '../atoms/Spinner';

export interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: ReactNode;
  loading?: boolean;
}

export function AuthLayout({ children, title, subtitle, loading = false }: AuthLayoutProps) {
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-zinc-400 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-zinc-50 p-4 dark:bg-zinc-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center">
        <Logo size="lg" />
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          {subtitle}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="bg-white/80 backdrop-blur-md">
          <CardContent className="pt-6">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
