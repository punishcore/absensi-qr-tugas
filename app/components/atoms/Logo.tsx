import Link from 'next/link';

export interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
}

export function Logo({ className = '', size = 'md', withText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 'h-8 w-8 text-sm', text: 'text-lg' },
    md: { icon: 'h-9 w-9 text-base', text: 'text-xl' },
    lg: { icon: 'h-12 w-12 text-xl', text: 'text-3xl' },
  };

  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className={`flex items-center justify-center rounded-lg bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20 ${sizes[size].icon}`}>
        QR
      </div>
      {withText && (
        <span className={`font-bold tracking-tight text-zinc-950 dark:text-white ${sizes[size].text}`}>
          Absen<span className="text-emerald-500">QR</span>
        </span>
      )}
    </Link>
  );
}
