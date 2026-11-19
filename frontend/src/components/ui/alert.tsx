import * as React from 'react';
import { cn } from '../../lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'warning' | 'success';
}

export function Alert({ className, variant = 'default', ...props }: AlertProps) {
  const variantStyles = {
    default: 'bg-white text-slate-900 border-slate-200',
    destructive: 'border-rose-300 bg-rose-50/90 text-rose-950 [&>svg]:text-rose-600',
    warning: 'border-amber-300 bg-amber-50/90 text-amber-950 [&>svg]:text-amber-600',
    success: 'border-emerald-300 bg-emerald-50/90 text-emerald-950 [&>svg]:text-emerald-600',
  };

  return (
    <div
      role="alert"
      className={cn(
        'relative w-full rounded-lg border p-4 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-slate-950 [&>svg~*]:pl-7',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn('mb-1 font-semibold leading-none tracking-tight text-sm', className)}
      {...props}
    />
  );
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      className={cn('text-xs leading-relaxed opacity-90', className)}
      {...props}
    />
  );
}
