import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variantStyles = {
      default:
        'bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-colors',
      destructive:
        'bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition-colors',
      outline:
        'border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 shadow-sm transition-colors',
      secondary:
        'bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors',
      ghost:
        'hover:bg-slate-100 text-slate-700 transition-colors',
      link:
        'text-blue-600 underline-offset-4 hover:underline p-0 h-auto',
    };

    const sizeStyles = {
      default: 'h-9 px-4 py-2 text-sm',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-10 rounded-md px-6 text-base',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
