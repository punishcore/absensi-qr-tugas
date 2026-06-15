import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', fullWidth = false, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-500 shadow-md dark:bg-emerald-500 dark:hover:bg-emerald-400',
      secondary: 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 focus:ring-zinc-500 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white',
      danger: 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500 shadow-md dark:bg-red-700 dark:hover:bg-red-600',
      outline: 'border border-emerald-600 text-emerald-600 hover:bg-emerald-50 focus:ring-emerald-500 dark:border-emerald-500 dark:text-emerald-500 dark:hover:bg-emerald-950/30',
      ghost: 'bg-transparent text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-500 dark:text-zinc-300 dark:hover:bg-zinc-800',
    };

    const sizes = {
      sm: 'py-1.5 px-3 text-sm rounded-lg',
      md: 'py-2.5 px-4 text-sm',
      lg: 'py-3 px-6 text-base',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
