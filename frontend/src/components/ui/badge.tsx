import * as React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'risk' | 'warn' | 'ok' | 'info';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variantStyles = {
    default:
      'border-transparent bg-slate-900 text-white shadow hover:bg-slate-800',
    secondary:
      'border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200',
    destructive:
      'border-transparent bg-rose-600 text-white shadow hover:bg-rose-700',
    outline: 'text-slate-800 border-slate-300',
    risk: 'border-rose-200 bg-rose-50 text-rose-800 font-semibold',
    warn: 'border-amber-200 bg-amber-50 text-amber-800 font-semibold',
    ok: 'border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold',
    info: 'border-sky-200 bg-sky-50 text-sky-800 font-semibold',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
