import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    const baseStyles = 'block w-full rounded-xl border bg-white/50 py-2.5 px-3.5 text-zinc-900 shadow-sm focus:outline-none focus:ring-1 sm:text-sm dark:bg-zinc-800/50 dark:text-white transition-colors';
    
    const stateStyles = error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700/50 dark:focus:border-red-500' 
      : 'border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500 dark:border-zinc-800';

    return (
      <input
        ref={ref}
        className={`${baseStyles} ${stateStyles} ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
