'use client';

import { ReactNode } from 'react';
import { Navbar } from '../organisms/Navbar';
import AuthGuard from '../AuthGuard';

export interface DashboardLayoutProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'guru' | 'user')[];
  title?: string;
  description?: string;
}

export function DashboardLayout({ children, allowedRoles, title, description }: DashboardLayoutProps) {
  return (
    <AuthGuard allowedRoles={allowedRoles}>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        
        {/* Background blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-20 animate-blob"></div>
          <div className="absolute top-40 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {(title || description) && (
            <div className="mb-8">
              {title && <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{title}</h1>}
              {description && <p className="mt-2 text-zinc-600 dark:text-zinc-400">{description}</p>}
            </div>
          )}
          
          <div className="space-y-8 relative">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
